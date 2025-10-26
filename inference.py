# import json
# from typing import List, Dict, Any
# from recommender import SchemeRecommender, UserProfile


# def load_model(model_path: str) -> SchemeRecommender:
# 	return SchemeRecommender.load(model_path)


# def recommend(model: SchemeRecommender, profile: Dict[str, Any], top_k: int = 10) -> List[Dict[str, Any]]:
# 	user = UserProfile(
# 		name=profile.get("name"),
# 		phone=profile.get("phone"),
# 		age=profile.get("age"),
# 		income=profile.get("income"),
# 		caste_group=profile.get("caste_group"),
# 		occupation=profile.get("occupation"),
# 		gender=profile.get("gender"),
# 		state=profile.get("state"),
# 		interests=profile.get("interests"),
# 		previous_applications=profile.get("previous_applications"),
# 	)
# 	df = model.recommend(user, top_k=top_k)
# 	cols = [c for c in [
# 		"scheme_name", "slug", "level", "schemeCategory", "tags",
# 		"details", "benefits", "eligibility", "application", "documents",
# 		"score_hybrid", "score_content", "score_eligibility", "score_popularity"
# 	] if c in df.columns]
# 	return df[cols].to_dict(orient="records")


# if __name__ == "__main__":
# 	import argparse
# 	parser = argparse.ArgumentParser(description="Run inference for scheme recommendations")
# 	parser.add_argument("--model", default="artifacts/scheme_recommender.joblib")
# 	parser.add_argument("--profile", required=True, help="JSON string of user profile")
# 	parser.add_argument("--top_k", type=int, default=10)
# 	args = parser.parse_args()

# 	model = load_model(args.model)
# 	recs = recommend(model, json.loads(args.profile), top_k=args.top_k)
# 	print(json.dumps(recs, ensure_ascii=False, indent=2))
import json
from typing import List, Dict, Any
from recommender import SchemeRecommender, UserProfile


def load_model(model_path: str) -> SchemeRecommender:
    return SchemeRecommender.load(model_path)


def recommend(model: SchemeRecommender, profile: Dict[str, Any], top_k: int = 10) -> List[Dict[str, Any]]:
    user = UserProfile(
        name=profile.get("name"),
        phone=profile.get("phone"),
        age=profile.get("age"),
        income=profile.get("income"),
        caste_group=profile.get("caste_group"),
        occupation=profile.get("occupation"),
        gender=profile.get("gender"),
        state=profile.get("state"),
        interests=profile.get("interests"),
        previous_applications=profile.get("previous_applications"),
    )
    df = model.recommend(user, top_k=top_k)
    cols = [c for c in [
        "scheme_name", "slug", "level", "schemeCategory", "tags",
        "details", "benefits", "eligibility", "application", "documents",
        "score_hybrid", "score_content", "score_eligibility", "score_popularity"
    ] if c in df.columns]
    return df[cols].to_dict(orient="records")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run inference for scheme recommendations")
    parser.add_argument("--model", default="artifacts/scheme_recommender.joblib", help="Path to saved model")
    parser.add_argument("--profile", help="User profile as JSON string")
    parser.add_argument("--profile_file", help="Path to JSON file containing user profile")
    parser.add_argument("--top_k", type=int, default=10, help="Number of recommendations to return")
    args = parser.parse_args()

    # Load model
    model = load_model(args.model)

    # Load profile (from file if provided, else from string)
    if args.profile_file:
        with open(args.profile_file, "r", encoding="utf-8") as f:
            profile = json.load(f)
    elif args.profile:
        profile = json.loads(args.profile)
    else:
        raise ValueError("Either --profile or --profile_file must be provided")

    # Run recommendation
    recs = recommend(model, profile, top_k=args.top_k)
    print(json.dumps(recs, ensure_ascii=False, indent=2))
