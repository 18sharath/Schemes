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
			# Add age-related keywords
			if self.age >= 60:
				parts.extend(["senior", "elderly", "pension", "old age"])
			elif self.age < 18:
				parts.extend(["child", "minor", "student", "youth"])
			elif 18 <= self.age <= 35:
				parts.extend(["youth", "young", "adult"])
		if self.income is not None:
			parts.append(f"income {self.income}")
			if self.income <= 150000:
				parts.extend(["bpl", "below poverty", "economically weaker", "poor"])
			elif self.income <= 300000:
				parts.extend(["low income", "middle class"])
		if self.caste_group:
			parts.append(self.caste_group)
			# Add related terms
			cg_lower = self.caste_group.lower()
			if "sc" in cg_lower:
				parts.append("scheduled caste")
			if "st" in cg_lower:
				parts.append("scheduled tribe")
			if "obc" in cg_lower or "bc" in cg_lower:
				parts.extend(["backward class", "obc"])
		if self.occupation:
			parts.append(self.occupation)
			# Add occupation-related keywords
			occ_lower = self.occupation.lower()
			if "farm" in occ_lower or "agricult" in occ_lower:
				parts.extend(["farmer", "agriculture", "farming", "crop"])
			if "student" in occ_lower or "school" in occ_lower:
				parts.extend(["student", "education", "scholarship", "school"])
			if "teach" in occ_lower:
				parts.extend(["teacher", "educator", "education"])
			if "business" in occ_lower or "entrepreneur" in occ_lower:
				parts.extend(["business", "entrepreneur", "startup", "trader"])
		if self.gender:
			parts.append(self.gender)
			g_lower = self.gender.lower()
			if g_lower.startswith("f"):
				parts.extend(["female", "women", "woman", "ladies"])
			elif g_lower.startswith("m"):
				parts.extend(["male", "men"])
		if self.state:
			parts.append(self.state)
		if self.interests:
			parts.extend(self.interests)
			# Add related terms for common interests
			interests_lower = " ".join(self.interests).lower()
			if "education" in interests_lower:
				parts.extend(["education", "scholarship", "school", "college", "study"])
			if "health" in interests_lower:
				parts.extend(["health", "medical", "hospital", "treatment"])
			if "employment" in interests_lower or "job" in interests_lower:
				parts.extend(["employment", "job", "career", "work"])
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
		# Enhanced eligibility scoring with more flexible matching
		text = " ".join([
			_safe_str(row.get("eligibility", "")),
			_safe_str(row.get("tags", "")),
			_safe_str(row.get("schemeCategory", "")),
			_safe_str(row.get("details", "")),
			_safe_str(row.get("benefits", "")),
			_safe_str(row.get("scheme_name", "")),
		]).lower()

		score = 0.0
		total_weight = 0.0
		matches = 0

		def add(cond: bool, weight: float):
			nonlocal score, total_weight, matches
			total_weight += weight
			if cond:
				score += weight
				matches += 1

		# Age - Enhanced with more patterns
		if profile.age is not None:
			age = profile.age
			# Senior citizen schemes
			add(("60" in text or "senior" in text or "old age" in text or "elderly" in text or "pension" in text) and age >= 60, 1.2)
			add(("45" in text and "60" in text and 45 <= age <= 60) or ("45 – 60" in text and 45 <= age <= 60) or ("45-60" in text and 45 <= age <= 60), 1.0)
			add(("18" in text or "adult" in text) and age >= 18, 0.5)
			add(("youth" in text or "young" in text) and 18 <= age <= 35, 0.7)
			add(("child" in text or "minor" in text) and age < 18, 0.8)
			# General age eligibility - give partial credit
			if "age" in text:
				add(True, 0.3)

		# Gender - More flexible matching
		if profile.gender:
			g = profile.gender.lower()
			add((g.startswith("f") and ("female" in text or "women" in text or "woman" in text or "ladies" in text)), 1.2)
			add((g.startswith("m") and ("male" in text or "men" in text or "man" in text)), 0.8)
			add(("transgender" in text and "trans" in g), 1.0)
			# General gender-neutral schemes get partial credit
			if not any(x in text for x in ["female", "women", "male", "men", "gender"]):
				add(True, 0.2)

		# Income - More flexible income matching
		if profile.income is not None:
			income = profile.income
			add(("bpl" in text or "below poverty" in text or "economically weaker" in text or "ews" in text) and income <= 150000, 1.0)
			add(("apl" in text or "above poverty" in text) and income > 150000, 0.6)
			add(("income" in text and income <= 300000), 0.5)
			add(("low income" in text and income <= 500000), 0.4)
			# General income-based schemes
			if "income" in text:
				add(True, 0.3)

		# Caste/Category - Enhanced matching
		if profile.caste_group:
			cg = profile.caste_group.lower()
			add(("sc" in text and "sc" in cg) or ("scheduled caste" in text and "sc" in cg), 1.0)
			add(("st" in text and "st" in cg) or ("scheduled tribe" in text and "st" in cg), 1.0)
			add(("obc" in text and "obc" in cg) or ("backward class" in text and ("obc" in cg or "bc" in cg)), 1.0)
			add(("minority" in text and ("minority" in cg or "muslim" in cg or "christian" in cg or "sikh" in cg or "jain" in cg or "buddhist" in cg)), 0.8)
			add(("kapu" in text and "kapu" in cg), 1.0)
			add(("general" in text and "general" in cg), 0.6)
			# If no specific category mentioned, give partial credit
			if not any(x in text for x in ["sc", "st", "obc", "minority", "caste", "category"]):
				add(True, 0.3)

		# Occupation - Much more comprehensive
		if profile.occupation:
			occ = profile.occupation.lower()
			# Farmer related
			add(("farmer" in text or "agriculture" in text or "farming" in text or "crop" in text) and ("farm" in occ or "agricult" in occ), 1.2)
			# Student related
			add(("student" in text or "education" in text or "scholarship" in text or "school" in text or "college" in text) and ("student" in occ or "school" in occ or "study" in occ), 1.0)
			# Professional
			add(("weaver" in text and "weav" in occ), 1.0)
			add(("advocate" in text or "lawyer" in text) and ("law" in occ or "advocat" in occ), 0.9)
			add(("teacher" in text or "educator" in text) and "teach" in occ, 0.9)
			add(("doctor" in text or "medical" in text) and "medic" in occ, 0.9)
			add(("engineer" in text) and "engineer" in occ, 0.8)
			# Business/Entrepreneur
			add(("entrepreneur" in text or "business" in text or "startup" in text) and ("business" in occ or "entrepreneur" in occ or "trader" in occ), 0.9)
			# Unemployed
			add(("unemployed" in text or "jobless" in text) and ("unemployed" in occ or "jobless" in occ), 0.8)
			# General employment schemes
			if "employment" in text or "job" in text:
				add(True, 0.4)

		# Interests - Match with scheme category and tags
		if profile.interests:
			interests_text = " ".join(profile.interests).lower()
			for interest in profile.interests:
				interest_lower = interest.lower()
				if interest_lower in text:
					add(True, 0.5)
			# Fuzzy match interests
			if profile.interests:
				ratio = fuzz.partial_ratio(interests_text, text)
				if ratio > 40:
					add(True, (ratio / 100.0) * 0.4)

		# State/Level - Enhanced matching
		if profile.state:
			st = profile.state.lower()
			add((st in text) or ("state" in _safe_str(row.get("level", "")).lower() and st in text), 0.7)
			# Central schemes are available to all
			if "central" in _safe_str(row.get("level", "")).lower():
				add(True, 0.5)

		# Enhanced fuzzy matching with profile summary
		profile_text = profile.to_query_text()
		if profile_text:
			# Multiple fuzzy matching strategies
			token_ratio = fuzz.token_set_ratio(profile_text.lower(), text)
			partial_ratio = fuzz.partial_ratio(profile_text.lower(), text)
			ratio_ratio = fuzz.ratio(profile_text.lower(), text)
			
			# Use the best match
			best_ratio = max(token_ratio, partial_ratio * 0.8, ratio_ratio * 0.7)
			
			# More generous mapping - give credit even for partial matches
			if best_ratio > 20:
				add(True, (best_ratio / 100.0) * 0.8)

		# Baseline score - ensure minimum score for any scheme
		baseline = 0.15  # 15% baseline for any scheme
		
		# Calculate weighted score
		if total_weight > 0:
			weighted_score = min(1.0, score / total_weight)
		else:
			weighted_score = 0.0
		
		# Combine with baseline and boost based on number of matches
		match_boost = min(0.2, matches * 0.05)  # Up to 20% boost for multiple matches
		final_score = min(1.0, baseline + weighted_score * 0.7 + match_boost)
		
		return final_score

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

		# Build query vector from profile/interests with enhanced expansion
		query_text = profile.to_query_text()
		if not query_text:
			# Default query uses common keywords so cosine doesn't collapse
			query_text = (
				"government scheme benefit assistance subsidy farmer student women minority "
				"employment education health pension insurance loan training disability rural "
				"urban sanitation agriculture entrepreneur skilling scholarship"
			)
		else:
			# Add general scheme-related terms to improve matching
			query_text += " government scheme benefit assistance subsidy support aid help"

		# Transform the query and the filtered scheme texts (use vectorizer already fitted)
		concatenated_texts = ColumnConcatenator(self.text_columns).transform(df)
		query_vec = self.vectorizer.transform([query_text])
		content_scores = cosine_similarity(query_vec, self.vectorizer.transform(concatenated_texts)).ravel()

		# Eligibility scores (calculated on filtered df)
		elig_scores = np.array([self._eligibility_score(row, profile) for _, row in df.iterrows()])

		# Popularity from filtered df
		pop_scores = df["__popularity__"].values

		# Normalize and boost content scores (they're typically low)
		# Apply square root to boost low scores more
		content_scores_normalized = np.sqrt(np.maximum(content_scores, 0))
		# Scale to 0-1 range more generously
		if content_scores_normalized.max() > 0:
			content_scores_normalized = 0.3 + 0.7 * (content_scores_normalized / content_scores_normalized.max())
		else:
			content_scores_normalized = np.full_like(content_scores_normalized, 0.3)

		# Hybrid score with normalized content scores
		hybrid = (
			content_weight * content_scores_normalized +
			eligibility_weight * elig_scores +
			popularity_weight * pop_scores
		)

		# Apply min-max normalization to boost scores to a better range
		# This ensures top recommendations have scores in 50-90% range
		if hybrid.max() > hybrid.min():
			# Normalize to 0.4-0.95 range (40% to 95%)
			hybrid_normalized = 0.4 + 0.55 * ((hybrid - hybrid.min()) / (hybrid.max() - hybrid.min() + 1e-9))
		else:
			hybrid_normalized = np.full_like(hybrid, 0.5)

		# Top-k indices relative to filtered df
		indices = np.argsort(-hybrid_normalized)[:top_k]
		out = df.iloc[indices].copy()
		
		# Store original scores for transparency
		out["score_content"] = content_scores[indices]
		out["score_eligibility"] = elig_scores[indices]
		out["score_popularity"] = pop_scores[indices]
		# Use normalized hybrid score for final ranking
		out["score_hybrid"] = hybrid_normalized[indices]

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
