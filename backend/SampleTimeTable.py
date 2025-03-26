from pymongo import MongoClient
import dotenv
import os

# Load environment variables from .env file
dotenv.load_dotenv()

# Connect to MongoDB
MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI, tls=True, tlsAllowInvalidCertificates=True)

db = client['attendance_system']
collection = db['timetable']

# Clear the collection before inserting new data
collection.delete_many({})

# Define the subjects (only 7)
subjects = [
    "Embedded Systems",
    "Fog and Edge Computing",
    "Data Structures",
    "Computer Networks",
    "Operating Systems",
    "Machine Learning",
    "Database Management Systems"
]

# Define the timetable slots (Monday to Friday, 8 am to 12 pm)
days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
time_slots = [
    ("08:00", "08:50"),
    ("09:00", "09:50"),
    ("10:00", "10:50"),
    ("11:00", "11:50")
]

# Spread the subjects evenly across the week
timetable_entries = []
subject_index = 0

for day in days:
    for start_time, end_time in time_slots:
        entry = {
            "day": day,
            "start_time": start_time,
            "end_time": end_time,
            "subject": subjects[subject_index % len(subjects)]
        }
        timetable_entries.append(entry)
        subject_index += 1

# Insert the timetable into the collection
if timetable_entries:
    collection.insert_many(timetable_entries)
    print(f"Inserted {len(timetable_entries)} timetable entries successfully.")

# Display the inserted documents
for doc in collection.find():
    print(doc)
