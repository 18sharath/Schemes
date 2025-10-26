import pandas as pd

# Load dataset
df = pd.read_csv("updated_data.csv")

# Remove the column if it exists
if "applications_count" in df.columns:
    df = df.drop(columns=["applications_count"])
    df.to_csv("updated_data.csv", index=False)
    print("✅ 'applications_count' column removed successfully")
else:
    print("⚠️ Column 'applications_count' not found in dataset")
