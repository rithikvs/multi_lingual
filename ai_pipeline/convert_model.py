import os
import tensorflowjs as tfjs
import tensorflow as tf

def convert_keras_to_tfjs(model_path="sign_lstm_model.keras", output_dir="../frontend/public/model"):
    if not os.path.exists(model_path):
        # Check if .h5 variant exists
        h5_path = model_path.replace(".keras", ".h5")
        if os.path.exists(h5_path):
            model_path = h5_path
        else:
            print(f"Error: Model file '{model_path}' not found. Please train the model first.")
            return
        
    print(f"Loading Keras model from '{model_path}'...")
    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        print(f"Error loading Keras model: {e}")
        return
    
    print(f"Converting and exporting model to TensorFlow.js format in '{output_dir}'...")
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        tfjs.converters.save_keras_model(model, output_dir)
        print("Conversion completed successfully!")
    except Exception as e:
        print(f"Conversion error: {e}")
        print("Tip: Make sure the 'tensorflowjs' package is installed in your python environment.")

if __name__ == "__main__":
    convert_keras_to_tfjs()
    
# To convert manually via CLI, run:
# tensorflowjs_converter --input_format=keras_saved_model sign_lstm_model.keras ../frontend/public/model
