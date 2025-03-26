import pandas as pd
import cv2
import urllib.request
import numpy as np
import os
from datetime import datetime
import face_recognition
import json
import paho.mqtt.client as mqtt
import time

# Define paths
project_path = '/Users/ebrahimmamawala/Desktop/Fog_and_Edge_Computing/Project'
image_folder = os.path.join(project_path, 'image_folder')
attendance_file = os.path.join(project_path, 'attendance', 'Attendance.csv')
url = 'http://192.168.26.208/cam-mid.jpg'

# MQTT Broker details
broker = 'f443c2fc8f5543c4ab88174b8ff2a522.s1.eu.hivemq.cloud'
topic = 'attendance/detection'
client = mqtt.Client()
client.username_pw_set(username='hivemq.webclient.1741525685527', password='&<C;0,1D3AI9KerqJsdt')
client.tls_set()
client.connect(broker, 8883, 60)

# Ensure attendance directory exists
attendance_dir = os.path.join(project_path, 'attendance')
if not os.path.exists(attendance_dir):
    os.makedirs(attendance_dir)

# Remove existing attendance file if present
if os.path.exists(attendance_file):
    print("Attendance.csv exists, removing it...")
    os.remove(attendance_file)
else:
    print("No existing Attendance.csv found, creating a new one...")
    df = pd.DataFrame()
    df.to_csv(attendance_file)

# Load images and class names
images = []
fullNames = []
regNumbers = []
image_list = os.listdir(image_folder)
print("Images found:", image_list)

for img_name in image_list:
    img_path = os.path.join(image_folder, img_name)
    img = cv2.imread(img_path)
    if img is not None:
        images.append(img)
        name_parts = os.path.splitext(img_name)[0].split()
        reg_number = name_parts[-1]
        full_name = ' '.join(name_parts[:-1])
        fullNames.append(full_name)
        regNumbers.append(reg_number)
    else:
        print(f"Failed to load image: {img_name}")

print("Names:", fullNames)
print("Registration Numbers:", regNumbers)

# Function to encode images
def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(img)
        if encodings:
            encodeList.append(encodings[0])
        else:
            print("No face detected in image.")
    return encodeList

# Dictionary to store last marked attendance times
last_marked = {}
MIN_DELAY = 2  # Set to 1 second

# Function to mark attendance
def markAttendance(name, reg_number):
    now = datetime.now()
    dtString = now.strftime('%H:%M:%S')
    dateString = now.strftime('%Y-%m-%d')
    current_time = time.time()
    
    if name in last_marked and current_time - last_marked[name] < MIN_DELAY:
        return  # Skip marking attendance if within 1 second
    
    last_marked[name] = current_time
    data = {
        'name': name,
        'registration_number': reg_number,
        'time': dtString,
        'date': dateString
    }
    with open(attendance_file, 'a') as f:
        f.writelines(f'{name},{reg_number},{dtString},{dateString}\n')
    client.publish(topic, json.dumps(data))
    print(f"Published to MQTT: {data}")

# Encode known faces
encodeListKnown = findEncodings(images)
print('Encoding Complete')

# Start the webcam stream
while True:
    img_resp = urllib.request.urlopen(url)
    imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
    img = cv2.imdecode(imgnp, -1)

    if img is None:
        print("Failed to capture image from webcam.")
        continue

    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    facesCurFrame = face_recognition.face_locations(imgS)
    encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        matchIndex = np.argmin(faceDis)

        if matches[matchIndex]:
            name = fullNames[matchIndex]
            reg_number = regNumbers[matchIndex]
            display_text = f"{name} ({reg_number})"
            
            print(f"Detected: {name}, {reg_number}")
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, display_text, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 0.8, (255, 255, 255), 2)
            markAttendance(name, reg_number)

    cv2.imshow('Webcam', img)
    key = cv2.waitKey(5)
    if key == ord('q'):
        break

cv2.destroyAllWindows()
client.disconnect()
