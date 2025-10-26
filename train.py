import os
from recommender import train_and_save


def main():
	os.makedirs("artifacts", exist_ok=True)
	data_path = "updated_data.csv"
	model_out = os.path.join("artifacts", "scheme_recommender.joblib")
	# If your CSV has an applications/popularity column, set popularity_col here
	popularity_col = None
	train_and_save(data_path, model_out, popularity_col)
	print(f"Model saved to {model_out}")


if __name__ == "__main__":
	main()
