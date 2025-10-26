import re
import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator, TransformerMixin
from unidecode import unidecode
from rapidfuzz import fuzz
import joblib


TEXT_COLUMNS_DEFAULT = [
	"scheme_name", "details", "benefits", "eligibility", "application", "documents", "schemeCategory", "tags"
]


def _safe_str(x: Any) -> str:
	if pd.isna(x):
		return ""
	try:
		return unidecode(str(x))
	except Exception:
		return str(x)


def _normalize_whitespace(text: str) -> str:
	return re.sub(r"\s+", " ", text).strip()


class ColumnConcatenator(BaseEstimator, TransformerMixin):
	def __init__(self, columns: List[str]):
		self.columns = columns

	def fit(self, X: pd.DataFrame, y=None):
		return self

	def transform(self, X: pd.DataFrame):
		texts = (
			X[self.columns]
			# .applymap(_safe_str)
			.apply(lambda col: col.map(_safe_str))
			.apply(lambda row: " \n ".join([_normalize_whitespace(v) for v in row.values]), axis=1)
			.values
		)
		return texts


@dataclass
class UserProfile:
	name: Optional[str] = None
	phone: Optional[str] = None
	age: Optional[int] = None
	income: Optional[float] = None
	caste_group: Optional[str] = None
	occupation: Optional[str] = None
	gender: Optional[str] = None
	state: Optional[str] = None
	interests: Optional[List[str]] = None
	previous_applications: Optional[List[str]] = None

	def to_query_text(self) -> str:
		parts: List[str] = []
		if self.age is not None:
			parts.append(f"age {self.age}")
		if self.income is not None:
			parts.append(f"income {self.income}")
		if self.caste_group:
			parts.append(self.caste_group)
		if self.occupation:
			parts.append(self.occupation)
		if self.gender:
			parts.append(self.gender)
		if self.state:
			parts.append(self.state)
		if self.interests:
			parts.extend(self.interests)
		if self.previous_applications:
			parts.extend(self.previous_applications)
		return " ".join([_normalize_whitespace(unidecode(p)) for p in parts if p])


class SchemeRecommender:
	def __init__(
		self,
		text_columns: Optional[List[str]] = None,
		max_features: int = 100000,
		ngram_range: Tuple[int, int] = (1, 2),
		min_df: int = 2,
		stop_words: str = "english",
		popularity_col: Optional[str] = None,
	):
		self.text_columns = text_columns or TEXT_COLUMNS_DEFAULT
		self.vectorizer = TfidfVectorizer(
			max_features=max_features,
			ngram_range=ngram_range,
			min_df=min_df,
			stop_words=stop_words,
			lowercase=True,
		)
		self.popularity_col = popularity_col
		self.pipeline: Optional[Pipeline] = None
		self.scheme_df: Optional[pd.DataFrame] = None
		self.tfidf_matrix: Optional[np.ndarray] = None

	@staticmethod
	def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
		# Drop unnamed/empty columns
		df = df.copy()
		drop_cols = [c for c in df.columns if c.lower().startswith("unnamed") or c.strip() == ""]
		if drop_cols:
			df = df.drop(columns=drop_cols)
		# Standardize column names
		df.columns = [c.strip() for c in df.columns]
		# Fill missing text columns
		for c in df.columns:
			if df[c].dtype == object:
				df[c] = df[c].apply(_safe_str)
		return df

	def fit(self, df: pd.DataFrame):
		df = self.clean_dataframe(df)
		# Ensure required columns exist
		for c in self.text_columns:
			if c not in df.columns:
				df[c] = ""
		concatenated_text = ColumnConcatenator(self.text_columns).transform(df)
		self.tfidf_matrix = self.vectorizer.fit_transform(concatenated_text)
		# Popularity: if not provided, default to 1
		if self.popularity_col and self.popularity_col in df.columns:
			pop = pd.to_numeric(df[self.popularity_col], errors="coerce").fillna(0.0)
		else:
			pop = pd.Series(np.ones(len(df)), index=df.index)
		df["__popularity__"] = (pop - pop.min()) / (pop.max() - pop.min() + 1e-9)
		self.scheme_df = df
		return self

	def _eligibility_score(self, row: pd.Series, profile: UserProfile) -> float:
		# Heuristic rule-matcher over the eligibility text + tags
		text = " ".join([
			_safe_str(row.get("eligibility", "")),
			_safe_str(row.get("tags", "")),
			_safe_str(row.get("schemeCategory", "")),
			_safe_str(row.get("details", "")),
		]).lower()

		score = 0.0
		total_weight = 0.0

		def add(cond: bool, weight: float):
			nonlocal score, total_weight
			total_weight += weight
			if cond:
				score += weight

		# Age
		if profile.age is not None:
			# Simple band checks
			add(("60" in text or "senior" in text or "old age" in text) and profile.age >= 60, 1.0)
			add(("45" in text and "60" in text and 45 <= profile.age <= 60) or ("45 – 60" in text and 45 <= profile.age <= 60), 0.8)
			add(("18" in text and profile.age >= 18), 0.3)

		# Gender
		if profile.gender:
			g = profile.gender.lower()
			add((g.startswith("f") and ("female" in text or "women" in text)), 1.0)
			add((g.startswith("m") and ("male" in text or "men" in text)), 0.6)

		# Income
		if profile.income is not None:
			add(("bpl" in text or "below poverty" in text or "economically weaker" in text) and profile.income <= 150000, 0.8)
			add(("income" in text and profile.income <= 300000), 0.4)

		# Caste/Category
		if profile.caste_group:
			cg = profile.caste_group.lower()
			add(("sc" in text and "sc" in cg) or ("scheduled caste" in text and "sc" in cg), 0.7)
			add(("st" in text and "st" in cg) or ("scheduled tribe" in text and "st" in cg), 0.7)
			add(("obc" in text and "obc" in cg) or ("backward class" in text and ("obc" in cg or "bc" in cg)), 0.7)
			add(("minority" in text and ("minority" in cg or "muslim" in cg or "christian" in cg or "sikh" in cg)), 0.5)
			add(("kapu" in text and "kapu" in cg), 0.9)

		# Occupation
		if profile.occupation:
			occ = profile.occupation.lower()
			add(("farmer" in text and "farm" in occ), 0.9)
			add(("weaver" in text and "weav" in occ), 0.9)
			add(("student" in text and ("student" in occ or "school" in occ)), 0.6)
			add(("advocate" in text and "law" in occ), 0.7)

		# State/Level
		if profile.state:
			st = profile.state.lower()
			add((st in text) or ("state" in _safe_str(row.get("level", "")).lower() and st in text), 0.5)

		# Fallback: fuzzy match between eligibility and a profile summary
		profile_text = profile.to_query_text()
		if profile_text:
			ratio = fuzz.token_set_ratio(profile_text.lower(), text)
			# Map 0..100 to 0..0.6
			add(ratio > 30, (ratio / 100.0) * 0.6)

		return 0.0 if total_weight == 0 else min(1.0, score / total_weight)

	def recommend(
		self,
		profile: UserProfile,
		top_k: int = 10,
		content_weight: float = 0.6,
		eligibility_weight: float = 0.3,
		popularity_weight: float = 0.1,
	) -> pd.DataFrame:
		assert self.scheme_df is not None and self.tfidf_matrix is not None

		# --- 🔹 NEW: filter by state (keep central + user's state) ---
		df = self.scheme_df.copy()
		if profile.state:
			st = profile.state.lower().strip()
			# start with central-level schemes
			mask = df.get("level", "").astype(str).str.lower().str.contains("central", na=False)

			# keep if there is an explicit 'state' or 'states' column that matches
			if "state" in df.columns:
				mask |= df["state"].astype(str).str.lower().str.contains(st, na=False)
			if "states" in df.columns:
				mask |= df["states"].astype(str).str.lower().str.contains(st, na=False)

			# also search for state name inside key text columns (details, eligibility, tags, name)
			text_cols = ["details", "eligibility", "tags", "scheme_name", "schemeCategory"]
			for c in text_cols:
				if c in df.columns:
					mask |= df[c].astype(str).str.lower().str.contains(st, na=False)

			df = df[mask].copy()

			# fallback to full dataset if no matches (avoid empty results)
			if df.empty:
				df = self.scheme_df.copy()

		# Build query vector from profile/interests
		query_text = profile.to_query_text()
		if not query_text:
			# Default query uses common keywords so cosine doesn't collapse
			query_text = (
				"government scheme benefit assistance subsidy farmer student women minority "
				"employment education health pension insurance loan training disability rural "
				"urban sanitation agriculture entrepreneur skilling scholarship"
			)

		# Transform the query and the filtered scheme texts (use vectorizer already fitted)
		concatenated_texts = ColumnConcatenator(self.text_columns).transform(df)
		query_vec = self.vectorizer.transform([query_text])
		content_scores = cosine_similarity(query_vec, self.vectorizer.transform(concatenated_texts)).ravel()

		# Eligibility scores (calculated on filtered df)
		elig_scores = np.array([self._eligibility_score(row, profile) for _, row in df.iterrows()])

		# Popularity from filtered df
		pop_scores = df["__popularity__"].values

		# Hybrid score
		hybrid = (
			content_weight * content_scores +
			eligibility_weight * elig_scores +
			popularity_weight * pop_scores
		)

		# Top-k indices relative to filtered df
		indices = np.argsort(-hybrid)[:top_k]
		out = df.iloc[indices].copy()
		out["score_content"] = content_scores[indices]
		out["score_eligibility"] = elig_scores[indices]
		out["score_popularity"] = pop_scores[indices]
		out["score_hybrid"] = hybrid[indices]

		return out


	def save(self, path: str):
		assert self.scheme_df is not None and self.tfidf_matrix is not None
		joblib.dump({
			"vectorizer": self.vectorizer,
			"columns": self.text_columns,
			"scheme_df": self.scheme_df,
			"tfidf_shape": self.tfidf_matrix.shape,
			"popularity_col": self.popularity_col,
		}, path)

	@staticmethod
	def load(path: str) -> "SchemeRecommender":
		blob = joblib.load(path)
		rec = SchemeRecommender(
			text_columns=blob["columns"],
			popularity_col=blob.get("popularity_col"),
		)
		rec.vectorizer = blob["vectorizer"]
		rec.scheme_df = blob["scheme_df"]
		# We will lazily rebuild tfidf_matrix from vectorizer and texts if needed on demand
		concatenated_text = ColumnConcatenator(rec.text_columns).transform(rec.scheme_df)
		rec.tfidf_matrix = rec.vectorizer.transform(concatenated_text)
		return rec


def load_dataset(csv_path: str) -> pd.DataFrame:
	df = pd.read_csv(csv_path, encoding="utf-8", engine="python")
	return df


def train_and_save(csv_path: str, model_out: str, popularity_col: Optional[str] = None) -> None:
	df = load_dataset(csv_path)
	rec = SchemeRecommender(popularity_col=popularity_col)
	rec.fit(df)
	rec.save(model_out)


def recommend_cli(model_path: str, profile_json: str, top_k: int = 10) -> List[Dict[str, Any]]:
	rec = SchemeRecommender.load(model_path)
	profile_dict = json.loads(profile_json)
	profile = UserProfile(
		name=profile_dict.get("name"),
		phone=profile_dict.get("phone"),
		age=profile_dict.get("age"),
		income=profile_dict.get("income"),
		caste_group=profile_dict.get("caste_group"),
		occupation=profile_dict.get("occupation"),
		gender=profile_dict.get("gender"),
		state=profile_dict.get("state"),
		interests=profile_dict.get("interests"),
		previous_applications=profile_dict.get("previous_applications"),
	)
	df = rec.recommend(profile, top_k=top_k)
	cols = [c for c in [
		"scheme_name", "slug", "level", "schemeCategory", "tags",
		"details", "benefits", "eligibility", "application", "documents",
		"score_hybrid", "score_content", "score_eligibility", "score_popularity"
	] if c in df.columns]
	result = df[cols].to_dict(orient="records")
	return result


if __name__ == "__main__":
	import argparse
	parser = argparse.ArgumentParser(description="Train or run scheme recommender")
	sub = parser.add_subparsers(dest="cmd")

	t = sub.add_parser("train", help="Train model")
	t.add_argument("--data", required=True, help="Path to CSV")
	t.add_argument("--out", default="artifacts/scheme_recommender.joblib", help="Output model path")
	t.add_argument("--popularity_col", default=None, help="Optional popularity column in CSV")

	r = sub.add_parser("recommend", help="Recommend using saved model")
	r.add_argument("--model", required=True, help="Path to saved joblib")
	r.add_argument("--profile", required=True, help="User profile as JSON string")
	r.add_argument("--top_k", type=int, default=10)

	args = parser.parse_args()

	if args.cmd == "train":
		train_and_save(args.data, args.out, args.popularity_col)
		print(f"Saved model to {args.out}")
	elif args.cmd == "recommend":
		recs = recommend_cli(args.model, args.profile, top_k=args.top_k)
		print(json.dumps(recs, ensure_ascii=False, indent=2))
	else:
		parser.print_help()
