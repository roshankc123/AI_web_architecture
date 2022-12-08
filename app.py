from flask import * 
import cv2
from keras.models import load_model
import numpy as np
import pickle
from skimage.transform import resize

app = Flask(__name__)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/after', methods=['GET', 'POST'])
def after():
    img = request.files['file1']

    img.save('static/file.jpg')

    ####################################
    img1 = cv2.imread('static/file.jpg')
    gray = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier('haarcascade_frontalface_alt2.xml')
    faces = cascade.detectMultiScale(gray, 1.1, 3)

    for x,y,w,h in faces:
        cv2.rectangle(img1, (x,y), (x+w, y+h), (0,255,0), 2)

        cropped = img1[y:y+h, x:x+w]

    cv2.imwrite('static/after.jpg', img1)

    try:
        cv2.imwrite('static/cropped.jpg', cropped)

    except:
        pass

    #####################################

    try:
        image = cv2.imread('static/cropped.jpg', 0)
    except:
        image = cv2.imread('static/file.jpg', 0)

    image = resize(image, (48,48))

    # image = image/255.0

    image = [image.flatten()]

    # print(l)

    # image = np.reshape(image, (1,48,48,1))

    # image = image.reshape((1,48,48,1))

    # model = load_model('model_3.h5')
    model = pickle.load(open('SVM_model.pkl', 'rb'))

    # prediction = model.predict(image)

    prediction = model.predict(image)[0]


    print(prediction)

    label_map =   ['Anger', 'disgust' , 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    # prediction = np.argmax(prediction)

    print(prediction)

    final_prediction_1 = label_map[prediction]

    label_map_emo =   {'Anger' : '', 'disgust' : '', 'Fear' : '', 'Happy' : '😀','Neutral' : '😇' , 'Sad' : '', 'Surprise' : ''}

    final_prediction = label_map_emo[final_prediction_1]

    return render_template('after.html', data=final_prediction_1)

if __name__ == "__main__":
    app.run( '127.0.0.1', '8000' ,debug=True)


