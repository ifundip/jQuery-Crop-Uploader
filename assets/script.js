const consoleWarn = (str = '') => {
  return console.log(`%c${str}`, 'background: #ffeb3b; color: #333; padding: 5px 10px; border-radius: 3px;');
};

const readFile = file => {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(reader.result);
    }, false);

    reader.readAsDataURL(file);
  });
}

const dataURLtoFile = (dataurl, filename) => {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

const jbImageUploader = (callback) => {
  this.callback = callback;
  this.modalId = 'jb-image-uploader-modal';

  this.getModal = () => {
    return $(`#${this.modalId}`);
  };

  this.showModal = () => {
    this.getModal().modal('show');
  };

  this.closeModal = () => {
    this.getModal().modal('hide');
    consoleWarn('Modal closed');
  };

  this.removeModal = () => {
    this.getModal().remove();
    consoleWarn('Modal removed');
  };

  this.modalExist = () => {
    return this.getModal().length !== 0;
  };

  this.onUploadFinish = (...arguments) => {
    this.closeModal();
    this.callback.apply(null, arguments);
  }

  this.createModal = () => {
    if (this.modalExist()) return;

    const htmlString = `
      <div class="modal fade" id="${this.modalId}" tabindex="-1" role="dialog" aria-labelledby="modal-image-uploader" aria-hidden="true">
        <div class="modal-lg modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modal-image-uploader">Insert Image</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                  <a class="nav-item nav-link active" id="nav-modal-jbiu-input" data-toggle="tab" href="#nav-modal-jbiu-input-tab" role="tab" aria-controls="nav-modal-jbiu-input-tab" aria-selected="true">Upload</a>
                  <!--<a class="nav-item nav-link" id="nav-modal-jbiu-url" data-toggle="tab" href="#nav-modal-jbiu-url-tab" role="tab" aria-controls="nav-profile" aria-selected="false">URL</a>-->
                  <a class="nav-item nav-link" id="nav-modal-jbiu-camera" data-toggle="tab" href="#nav-modal-jbiu-camera-tab" role="tab" aria-controls="nav-modal-jbiu-camera-tab" aria-selected="false">Camera</a>
                </div>
              </nav>
              <div class="tab-content" id="nav-tabContent">
                <div class="p-3 tab-pane fade show active" id="nav-modal-jbiu-input-tab" role="tabpanel" aria-labelledby="nav-modal-jbiu-input">
                  <div id='image-upload-wrapper'>
                    <div class='image-upload-input-wrapper' style='height: 300px; line-height: 300px; text-align: center;'>
                      <label for='input-image-upload' class='btn btn-primary'>Upload image(s)</label>
                      <input style='display: none;' id='input-image-upload' class='image-add' type='file' accept='image/*' multiple/>
                    </div>
                    <div id='image-cropping'></div>
                  </div>
                </div>
                <div class="p-3 tab-pane fade" id="nav-modal-jbiu-url-tab" role="tabpanel" aria-labelledby="nav-modal-jbiu-url">
                  <div id='image-fetch-url-wrapper'>
                    <form id='image-fetch-url-form'>
                      <div class="form-row">
                        <div class="col-9">
                          <input value='https://s3.bukalapak.com/uploads/flash_banner/89363/homepage_banner/s-834-352/Banner_Desktop_Login-serburumah.jpg.webp' type="text" class="form-control" placeholder="Image URL">
                        </div>
                        <div class="col">
                          <button id='url-fetch-button' type='submit' class='form-control btn btn-primary'>Fetch</button>
                        </div>
                      </div>
                    </form>
                    <img src='' id='image-views'/>
                  </div>
                  <div id='image-cropping'></div>
                </div>
                <div class="p-3 tab-pane fade" id="nav-modal-jbiu-camera-tab" role="tabpanel" aria-labelledby="nav-modal-jbiu-camera">
                  <div id='image-capture-camera' class='text-center'>
                    <div style='display: none;' class='image-cropping'></div>
                    <canvas id="jbui-camera-canvas" style='width: 100%; height: 500px; display: none;'></canvas>
                    <div class='btns' style='display: none;'>
                      <button type='button' class='btn btn-danger float-left' id='jbui-camera-cancel-btn'>Cancel</button>
                      <button type='button' class='btn btn-primary float-right' id='jbui-camera-upload-btn'>Upload</button>
                    </div>
                    <video id="jbui-camera-video" controls autoplay style='width: 100%; height: 500px;'></video>
                    <button type='button' id="jbui-camera-capture" class='btn btn-primary'>Capture</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const $modal = $(htmlString);
    $modal.find('#image-upload-wrapper').imageManagement({
      onFinish: this.onUploadFinish
    });
    $modal.find('#image-fetch-url-wrapper').urlFetchImage({
      onFinish: this.onUploadFinish
    });
    $modal.find('#nav-modal-jbiu-camera')
      .on('show.bs.tab', () => {
        $('#image-capture-camera').cameraCapture({
          start: true,
          onFinish: this.onUploadFinish
        });
        consoleWarn('Camera');
      })
      .on('hide.bs.tab', () => {
        $('#image-capture-camera').cameraCapture({
          stop: true,
        });
        consoleWarn('Camera hide');
      });
    $('body').append($modal);

    // add event listener
    this.getModal().on('hidden.bs.modal', () => {
      $('#image-capture-camera').cameraCapture({
        stop: true,
      });
      this.removeModal();
    });
  };

  return this;
};

function jb_upload_image() {
  const j = jbImageUploader((ori, uploaded) => {
    console.log(ori, uploaded);
  });
  j.createModal();
  j.showModal();
}

const uploadFileToServer = (file) => {
  const formData = new FormData();
  const cdnUrl = 'http://localhost:3000/';

  formData.append('image', file);

  return $.ajax({
    url: cdnUrl,
    type: 'POST',
    data: formData,
    dataType: 'json',
    enctype: 'multipart/form-data',
    processData: false,
    contentType: false,
    cache: false
  });
}

const fetchFileData = async(file) => {
  const imgData = await readFile(file);

  return imgData;
}

(function($) {

  $.fn.cameraCapture = function(options={}) {
    const $elem = $(this);
    const $imageCrop = $elem.find('.image-cropping');
    const $btns = $elem.find('.btns');
    const $btnCapture = $elem.find('#jbui-camera-capture');
    const $btnCancel = $elem.find('#jbui-camera-cancel-btn');
    const $btnUpload = $elem.find('#jbui-camera-upload-btn');
    const $canvas = $elem.find('canvas');
    const $video = $elem.find('video');
    const $singleCanvas = $canvas[0];
    const $singleVideo = $video[0];

    const context = $canvas[0].getContext('2d');
    const constraints = {
      video: true,
    };

    this.toggleCanvas = () => {
      $btnCapture.toggle();
      $canvas.toggle();
      $video.toggle();
      $btns.toggle();

      return this;
    };

    this.showCropping = () => {
      $btns.hide();
      $canvas.hide();
      $video.hide();
      $imageCrop.show();
    };

    this.hideCropping = () => {
      $btns.show();
      $canvas.show();
      $imageCrop.hide();
    }

    this.stopTracking = () => {
      if ($singleVideo.srcObject) {
        $singleVideo.srcObject.getVideoTracks().forEach(track => track.stop());
      }

      return this;
    };

    this.startTracking = () => {
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          $singleVideo.srcObject = stream;
        });

      return this;
    }

    this.uploadFile = async(file) => {
      const fileData = await fetchFileData(file);
      const imageAjax = uploadFileToServer(file);
      options.onFinish(fileData, imageAjax);
    }
  
    this.cropImage = async(file) => {
      const $imageCropInside = $('<div></div>');
  
      $imageCrop.html('');
      $imageCrop.append($imageCropInside);

      this.showCropping();
      this.stopTracking();
      await $imageCropInside.imageCropping(file, {
        onFinish: this.uploadFile,
        onCancel: this.hideCropping
      });
    }

    if (options.start) {
      this.startTracking();
    }
    if (options.stop) {
      this.stopTracking();
    }

    // btn event handler
    $btnCapture.click(() => {
      // Reset canvas resolution with camera resolution
      const canvasWidth = $singleVideo.srcObject.getVideoTracks()[0].getSettings().width;
      const canvasHeight = $singleVideo.srcObject.getVideoTracks()[0].getSettings().height;
      
      $singleCanvas.width = canvasWidth;
      $singleCanvas.height = canvasHeight;

      context.drawImage($singleVideo, 0, 0, canvasWidth, canvasHeight);
      this.toggleCanvas();
      this.stopTracking();
    });

    $btnCancel.click(() => {
      this.toggleCanvas();
      this.startTracking();
    });

    $btnUpload.click(() => {
      const dataURL = $singleCanvas.toDataURL();
      const imageFile = dataURLtoFile(dataURL, 'camera_capture.png');

      this.cropImage(imageFile);
    });

    return this;
  }

  $.fn.imageCropping = async function(file, options = {}) {
    const self = this;
    const $elem = $(this);
    const $img = $('<img class="img-crop"/>');
    const $btnCancel = $('<button class="btn btn-danger">Cancel</button>');
    const $btnUpload = $('<button class="btn btn-primary">Upload</button>');
    const $btnWrapper = $('<div></div>').append($btnCancel).append($btnUpload);
  
    // attributes
    self.file = file;
    self.fileData = await readFile(file);
  
    // construct
    $img.attr('src', self.fileData);
    $elem.append($img);
    $elem.append($btnWrapper);
    self.$imgCropper = $img.cropper();
  
    // methods
    self.close = () => {
      $elem.remove();
    }
  
    self.upload = () => {
      const result = self.$imgCropper.cropper('getCroppedCanvas').toDataURL(file.type);
      const imageFile = dataURLtoFile(result, file.name);
      options.onFinish(imageFile);
      self.close();
    }
  
    // handlers
    $btnCancel.click(() => {
      if (options.onCancel) {
        options.onCancel();
      }
      self.close();
    });
    $btnUpload.click(self.upload);
  
    return self;
  }

  $.fn.urlFetchImage = function(options) {
    const $elem = $(this);
    const $fetchForm = $elem.find('#image-fetch-url-form');
    const $urlInput = $fetchForm.find('input');
    const $img = $elem.find('#image-views');

    this.isImageURLValid = (url, timeout = 5000) => {
      var timedOut = false, timer;
      var img = new Image();

      return new Promise((resolve, reject) => {
        img.onerror = img.onabort = function() {
          if (!timedOut) {
            clearTimeout(timer);
            resolve(false);
          }
        };
        img.onload = function() {
          if (!timedOut) {
            clearTimeout(timer);
            resolve(true);
          }
        };
        img.src = url;
        timer = setTimeout(function() {
          timedOut = true;
          // reset .src to invalid URL so it stops previous
          // loading, but doesn't trigger new load
          img.src = "//!!!!/test.jpg";
          reject(false);
        }, timeout); 
      })
    }

    this.setFormLoading = () => {
      $fetchForm.find('button[type=submit]').prop('disabled', true).text('Loading...');
    }

    this.setFormReady = () => {
      $fetchForm.find('button[type=submit]').prop('disabled', false).text('Fetch');
    }

    this.getDataFromUrl = (img) => {
      // Create an empty canvas element
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
  
      // Copy the image contents to the canvas
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      return ctx.getImageData(0, 0, img.width, img.height);
    }

    // form handler
    $fetchForm.on('submit', async(e) => {
      e.preventDefault();

      this.setFormLoading();

      const $url = $urlInput.val();
      const isImageValid = await this.isImageURLValid($url);

      if (!isImageValid) {
        alert('Not a valid URL');
        this.setFormReady();
      }

      consoleWarn($url);
      const url = `${$url}?${new Date().getTime()}`;
      $img.attr('src', url);
      const img = document.querySelector('#image-views');
      img.addEventListener('load', (ev) => {
        console.warn(this.getDataFromUrl(ev.currentTarget));
      });


      this.setFormReady();
    });

    return this;
  }
  
  $.fn.imageManagement = function(options) {
    const self = this;
    const $elem = $(this);
    const $addInput = $elem.find('.image-add');
    const $addInputWrapper = $elem.find('.image-upload-input-wrapper');
    const $imageCrop = $elem.find('#image-cropping');
  
    // attributes
    self.activeCrop = null;
  
    // custom functions
    self.resetInput = () => {
      $addInput.val('');
    }
  
    self.uploadFile = async(file) => {
      const fileData = await fetchFileData(file);
      const imageAjax = uploadFileToServer(file);
      options.onFinish(fileData, imageAjax);
    }
  
    self.cropImage = async(file) => {
      const $imageCropInside = $('<div></div>');
  
      $imageCrop.html('');
      $imageCrop.append($imageCropInside);
      $addInputWrapper.hide();
      await $imageCropInside.imageCropping(file, {
        onFinish: self.uploadFile,
        onCancel: self.cancelUpload
      });
    }
  
    self.cancelUpload = () => {
      $addInputWrapper.show();
    }
  
    self.uploads = (files = []) => {
      if (files.length === 1) {
        self.cropImage(files[0]);
        return;
      }
      $.each(files, (i, file) => {
        self.uploadFile(file);
      })
    }
  
    // button add handler
    $addInput.change(event => {
      const target = event.target;
  
      if (target.files && target.files[0]) {
        self.uploads(target.files);
      }
      self.resetInput();
    });
    
    return this;
  };
}(jQuery));