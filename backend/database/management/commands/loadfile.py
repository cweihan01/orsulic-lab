import pandas as pd
from django.core.management import BaseCommand

from database.models import Feature, Nuclear, Molecular, DrugScreen, Feature_TCGA, Nuclear_TCGA, Molecular_TCGA, Clinical_TCGA, FracLac_TCGA, Doberstein_TCGA
from database.utils.constants import CELL_LINES, PATIENTS


class Command(BaseCommand):
    help = "Reads in a CSV file and stores data to database"

    def add_arguments(self, parser):
        parser.add_argument("filepaths", nargs="+", type=str,
                            help="Paths to the CSV files")

    def handle(self, *args, **kwargs):
        filepaths = kwargs["filepaths"]

        for filepath in filepaths:
            try:
                df = pd.read_csv(filepath)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error reading file {filepath}: {e}"))
                continue

            total_rows = len(df)
            self.stdout.write(self.style.SUCCESS(
                f"Successfully loaded {filepath}. {total_rows} rows received."))

            # model_name = "_".join(filepath.split("/")[-1].replace(".csv", "").split("_")[:2])

            # add the following instead:
            filename = filepath.split("/")[-1].replace(".csv", "")
            parts = filename.split("_")

            if "TCGA" in parts:
                model_name = f"{parts[0]}_TCGA"   # e.g. Molecular_TCGA
            else:
                model_name = parts[0]             # e.g. Molecular

            is_tcga = "TCGA" in parts  # compute once and reuse

            model_class = globals().get(model_name)

            if model_class is None:
                self.stderr.write(self.style.ERROR(
                    f"Model class {model_name} not found. Skipping file {filepath}."))
                continue

            for idx, row in df.iterrows():
                self.stdout.write(self.style.SUCCESS(
                    f"Processing row {idx + 1} of {total_rows} in {filepath}"))

                feature_name = row.iloc[0]
                data_type = row.iloc[1]
                category = row.iloc[2]
                sub_category = row.iloc[3]
                values = row.iloc[4:]

                values = values.where(pd.notna(values), None)
                

                if is_tcga:
                    feature_obj, created = Feature_TCGA.objects.get_or_create(
                        name=feature_name, category=category,
                        sub_category=sub_category, defaults={"data_type": data_type}
                    )
                else:
                    feature_obj, created = Feature.objects.get_or_create(
                        name=feature_name, category=category,
                        sub_category=sub_category, defaults={"data_type": data_type}
                    )


                if not created:
                    feature_obj.data_type = data_type
                    feature_obj.save()

                data = {name: value for name, value in values.items()}

                self.update_or_create_model(model_class, feature_obj, data, is_tcga)
                
    def update_or_create_model(self, model_class, feature_obj, data, is_tcga):
        allowed = set(PATIENTS if is_tcga else CELL_LINES)
        valid_data = {k: v for k, v in data.items() if k in allowed}
        
        obj, created = model_class.objects.get_or_create(feature=feature_obj)
        for k, v in valid_data.items():
            setattr(obj, k, v)
        obj.save()

