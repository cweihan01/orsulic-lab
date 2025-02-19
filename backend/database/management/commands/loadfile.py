import pandas as pd
from django.core.management import BaseCommand
from database.models import Nuclear, Mole_GlobalChromatin, Feature, CELL_LINES

class Command(BaseCommand):
    help = "Reads in a CSV file and stores data to database"

    def add_arguments(self, parser):
        parser.add_argument("filepaths", nargs="+", type=str, help="Paths to the CSV files")

    def handle(self, *args, **kwargs):
        filepaths = kwargs["filepaths"]
        
        for filepath in filepaths:
            try:
                df = pd.read_csv(filepath)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error reading file {filepath}: {e}"))
                continue
            
            total_rows = len(df)
            self.stdout.write(self.style.SUCCESS(f"Successfully loaded {filepath}. {total_rows} rows received."))
            
            for idx, row in df.iterrows():
                self.stdout.write(self.style.SUCCESS(f"Processing row {idx + 1} of {total_rows} in {filepath}"))
                
                feature_name = row.iloc[0]
                data_type = row.iloc[1]
                cellline_values = row.iloc[2:]

                cellline_values = cellline_values.where(pd.notna(cellline_values), None)
                
                feature_obj, created = Feature.objects.get_or_create(name=feature_name, defaults={"data_type": data_type})
                
                if not created:
                    feature_obj.data_type = data_type
                    feature_obj.save()
                
                cellline_data = {cellline_name: value for cellline_name, value in cellline_values.items()}
                
                self.update_or_create_model(Nuclear, feature_obj, cellline_data)
                self.update_or_create_model(Mole_GlobalChromatin, feature_obj, cellline_data)
    
    def update_or_create_model(self, model_class, feature_obj, cellline_data):
        valid_cellline_data = {k: v for k, v in cellline_data.items() if k in CELL_LINES}
        model_class.objects.get_or_create(feature=feature_obj, defaults=valid_cellline_data)
