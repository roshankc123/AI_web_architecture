# from flask import * 
# import cv2
# from keras.models import load_model
# import numpy as np
# import pickle
# from skimage.transform import resize
# import random
# from tensorflow.keras.preprocessing import image
# from PIL import Image


def after():

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
        cropped_image = cv2.imread('static/cropped.jpg', 0)
    except:
        cropped_image = cv2.imread('static/file.jpg', 0)

    # image = resize(image, (48,48))

    gray_img = Image.fromarray(cropped_image).convert('L')
    # image = image/255.0

    # image = [image.flatten()]

    # print(l)

    resized_img = gray_img.resize((48, 48))
    img_array = np.array(resized_img)
    img_array = img_array.reshape((48, 48, 1))
    img_array = np.expand_dims(img_array, axis=0)
    scaled_img = img_array / 255.0
    model = load_model('64_accuracy_model.h5')
    prediction = model.predict(scaled_img)

    # image = image.reshape((1,48,48,1))


    # model = pickle.load(open('SVM_model.pkl', 'rb'))

    # prediction = model.predict(image)

    # prediction = model.predict(image)[0]

    pred_class = np.argmax(prediction)
    print(pred_class)

    label_map =   ['Anger', 'disgust' , 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    # prediction = np.argmax(prediction)
    print(prediction)
    print(pred_class)

    final_prediction_1 = label_map[pred_class]

    label_map_emo =   {'Anger' : '', 'disgust' : '', 'Fear' : '', 'Happy' : '😀','Neutral' : '😇' , 'Sad' : '', 'Surprise' : ''}

    final_prediction = label_map_emo[final_prediction_1]

    return final_prediction_1+',after.jpg'

print(after())