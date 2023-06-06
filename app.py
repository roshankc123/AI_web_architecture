from flask import * 
from OpenSSL import SSL
from flask_cors import CORS
import cv2
from keras.models import load_model
import numpy as np
import random
from PIL import Image

app = Flask(__name__)
CORS(app)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/after', methods=['GET', 'POST'])
def after():
    img = request.files['file1']

    img.save('static/file.jpg')
    aftername = str(random.randint(1, 100))
    print(aftername)
    ####################################
    img1 = cv2.imread('static/file.jpg')
    gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier('haarcascade_frontalface_alt2.xml')
    faces = cascade.detectMultiScale(gray, 1.1, 3)
    # if not faces:
    #     return ['not_detected', 'static/'+aftername+'.jpg']
    for x,y,w,h in faces:
        cv2.rectangle(img1, (x,y), (x+w, y+h), (0,255,0), 2)

        cropped = img1[y:y+h, x:x+w]

    cv2.imwrite('static/'+aftername+'.jpg', img1)
   
    try:
        cv2.imwrite('static/'+aftername+'.jpg', cropped)

    except:
        return ['not_detected', 'static/'+aftername+'.jpg']
        # pass

    #####################################

    try:
        cropped_image = cv2.imread('static/'+aftername+'.jpg', 0)
    except:
        cropped_image = cv2.imread('static/'+aftername+'.jpg', 0)

    # prediction pipeline starts
    

    gray_img = Image.fromarray(cropped_image).convert('L')
    resized_img = gray_img.resize((48, 48))
    img_array = np.array(resized_img)
    img_array = img_array.reshape((48, 48, 1))
    img_array = np.expand_dims(img_array, axis=0)
    scaled_img = img_array / 255.0
    model = load_model('64_accuracy_model.h5')
    prediction = model.predict(scaled_img)

    pred_class = np.argmax(prediction)
    
    # prediction pipeline ends 

    label_map =   ['Angry', 'disgust' , 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    print(pred_class)

    final_prediction_1 = label_map[pred_class]

    # label_map_emo =   {'Anger' : '😡', 'disgust' : '', 'Fear' : '', 'Happy' : '😀','Neutral' : '😇' , 'Sad' : '', 'Surprise' : ''}

    # final_prediction = label_map_emo[final_prediction_1]


    return [final_prediction_1, 'static/'+aftername+'.jpg']

server_ip = '127.0.0.1'
# server_ip = '192.168.1.67'

if __name__ == "__main__":
    context = ('cert.pem', 'key.pem')
    # app.run( server_ip, '8000' ,debug=True, ssl_context = context)
    app.run( server_ip, '8000' ,debug=True)


