import pandas as pd
from django.core.management import BaseCommand
from database.models import Feature, Correlation

class Command(BaseCommand):
    help = "Reads in a CSV file and stores correlations to database"

    def handle(self, *args, **kwargs):
        filepath = "testdata/correlations.csv"

        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading file: {e}"))
            return

        total_rows = len(df)
        self.stdout.write(self.style.SUCCESS(f"Successfully loaded {filepath}. {total_rows} rows received."))

        for idx, row in df.iterrows():
            self.stdout.write(self.style.SUCCESS(f"Processing row {idx + 1} of {total_rows}"))

            # Extract data for each row
            feature1_name = row.iloc[0]
            feature2_name = row.iloc[1]
            count = row.iloc[2]
            spearman_corr = row.iloc[3]
            spearman_pvalue = row.iloc[4]

            # Ensure features exist in Feature table
            try:
                feature1 = Feature.objects.get(name=feature1_name)
                feature2 = Feature.objects.get(name=feature2_name)
            except Feature.DoesNotExist as e:
                self.stderr.write(self.style.ERROR(f"Feature not found: {e}"))
                continue

            # Add to Correlation table
            relationship_data = {
                'count': count,
                'spearman_corr': spearman_corr,
                'spearman_pvalue': spearman_pvalue
            }

            # Use `update_or_create` to avoid duplicates
            Correlation.objects.update_or_create(
                feature1=feature1,
                feature2=feature2,
                defaults=relationship_data
            )

        self.stdout.write(self.style.SUCCESS("Correlations successfully loaded!"))
