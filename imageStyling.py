from PIL import Image
import numpy as np
import shutil, os

def scaling(number, scale_now:tuple, scale_new:tuple):
    range_now = scale_now[1] - scale_now[0]
    range_new = scale_new[1] - scale_new[0]
    number_new = ((number/range_now)*range_new) + scale_new[0]
    return number_new

def resize_image(image_path:str, format:tuple):
    if os.path.exists(image_path):
        shutil.copyfile(image_path, os.path.join(os.path.dirname(os.path.abspath(__file__)),"image_original_" + image_path.rsplit("\\")[len(image_path.rsplit("\\"))-1]))
        with Image.open(image_path) as img:
            resized_img = img.resize(format)
            resized_img.save(image_path)      
    else:
        raise Exception("Image doesn't exists!")
    
def grayscale_Image_to_array(image_path:str, debug:bool = False, size = (48,48), **kwargs):
    with Image.open(image_path) as img_file:
        #print(img_file.size)
        if img_file.size != size:
            resize_image(image_path, size)
            
    if kwargs:
        if kwargs["scale"]:
            image_scale = kwargs["scale"]
        else:
            raise Exception("wrong **kwarg")
    
    image = Image.open(image_path)
    try:
        grey_image = image.convert("L")
    except:
        raise Exception("couldn't convert it into greyscale")
    
    if debug:
        grey_image.show()
    numpy_array = np.array(grey_image)
    if debug:
        print(numpy_array.shape)
        
    if image_scale:
        scaled_numpy_array = []
        for i in range(len(numpy_array)):
            scaled_line = []
            for a in range(len(numpy_array[i])):
                scaled_line.append(scaling(numpy_array[i][a], (0,255), kwargs["scale"]))
            scaled_numpy_array.append(scaled_line)
        return scaled_numpy_array    
    else:
        return numpy_array
    
resize_image("image_original_icon1143.png", (32,32))