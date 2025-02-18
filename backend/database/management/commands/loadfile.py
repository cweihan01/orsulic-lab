import pandas as pd
from django.core.management import BaseCommand
from database.models import Nuclear, Feature

class Command(BaseCommand):
    help = "Reads in a CSV file and stores data to database"

    def handle(self, *args, **kwargs):
        filepath = "testdata/nuclear_features.csv"

        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading file: {e}"))
            return

        total_rows = len(df)
        self.stdout.write(self.style.SUCCESS(f"Successfully loaded {filepath}. {total_rows} rows received."))

        for idx, row in df.iterrows():
            self.stdout.write(self.style.SUCCESS(f"Processing row {idx + 1} of {total_rows}"))

            # Extract cell line name and depmap id
            # Note: most sheets will not need to process the slide name
            feature_name = row.iloc[0]
            data_type = row.iloc[1]
            cellline_values = row.iloc[2:]

            # Add to Feature model
            feature_obj, created = Feature.objects.get_or_create(name=feature_name, defaults={"data_type": data_type})

            # Update feature if exists
            if not created:
                feature_obj.data_type = data_type
                feature_obj.save()

            # Add to CellLine model
            cellline_data = {cellline_name: value for cellline_name, value in cellline_values.items()}
            Nuclear.objects.get_or_create(feature=feature_obj, defaults=cellline_data)

# class Command(BaseCommand):
#     help = "Reads in a CSV file and stores data to database"

#     def handle(self, *args, **kwargs):
#         filepath = "testdata/cell-lines-nuclear-features.csv"

#         try:
#             df = pd.read_csv(filepath)
#         except Exception as e:
#             self.stderr.write(self.style.ERROR(f"Error reading file: {e}"))
#             return

#         total_rows = len(df)
#         self.stdout.write(self.style.SUCCESS(f"Successfully loaded {filepath}. {total_rows} rows received."))

#         for i, row in df.iterrows():
#             self.stdout.write(self.style.SUCCESS(f"Processing row {i} of {total_rows}"))

#             # Extract cell line name and depmap id
#             # Note: most sheets will not need to process the slide name
#             slide_name = row.iloc[0]
#             cellline_name = slide_name[:slide_name.find("_")]
#             depmap_id = slide_name[slide_name.find("_") + 1 : slide_name.find(".")]
#             features = row.iloc[1:]

#             # Add to CellLine model
#             cellline_obj, created = CellLine.objects.get_or_create(depmap_id=depmap_id, name=cellline_name)

#             for feature_name, value in features.items():
#                 feature_obj, created = Feature.objects.get_or_create(name=feature_name)
#                 CellLineFeatureValue.objects.update_or_create(cellline=cellline_obj, feature=feature_obj, value=value)
