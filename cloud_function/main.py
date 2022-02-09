import numpy as np
import pandas as pd
from google.cloud import storage
import tensorflow as tf
import tensorflow_hub as hub

# Download model file from cloud storage bucket
def download_model():
    from google.cloud import storage

    # Model Bucket details
    BUCKET_NAME = "cloud_model_2021"
    PROJECT_ID = "cloudcomputing-334315"
    Weights1 = "variables.index"
    Weights2 = "variables.data-00000-of-00001"

    # Initialise a client
    client = storage.Client(PROJECT_ID)

    # Create a bucket object for our bucket
    bucket = client.get_bucket(BUCKET_NAME)

    # Create a blob object from the filepath
    blob_weights1 = bucket.blob(Weights1)
    blob_weights2 = bucket.blob(Weights2)

    blob_weights1.download_to_filename('/tmp/variables.index')
    blob_weights2.download_to_filename('/tmp/variables.data-00000-of-00001')

# Main entry point for the cloud function
def is_fake(request):
    data = request.get_data(True)
    download_model()

    embedding = "https://tfhub.dev/google/nnlm-en-dim50/2"
    hub_layer = hub.KerasLayer(embedding, input_shape=[], dtype=tf.string, trainable=True)
    model = tf.keras.Sequential()
    model.add(hub_layer)
    model.add(tf.keras.layers.Dense(16, activation='relu'))
    model.add(tf.keras.layers.Dense(1))

    model.load_weights('/tmp/variables')

    prediction = None

    if (data is not None):
        # Run a test prediction
        softmax_result = model.predict([[data]])

        if softmax_result <= 0:
            prediction = "False"
        else:
            prediction = "True"
    else:
        prediction = "nothing sent for prediction"

    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    
    return (prediction, 200, headers)