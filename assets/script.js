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

  this.consoleWarn = (str = '') => {
    return console.log(`%c ${str}`, 'background: #ffeb3b; color: #333; padding: 5px 10px; border-radius: 3px;');
  };

  this.getModal = () => {
    return $(`#${this.modalId}`);
  };

  this.showModal = () => {
    this.getModal().modal('show');
  };

  this.closeModal = () => {
    this.getModal().modal('hide');
    this.consoleWarn('Modal closed');
  };

  this.removeModal = () => {
    this.getModal().remove();
    this.consoleWarn('Modal removed');
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
                  <a class="nav-item nav-link" id="nav-modal-jbiu-url" data-toggle="tab" href="#nav-modal-jbiu-url-tab" role="tab" aria-controls="nav-profile" aria-selected="false">URL</a>
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
                  Url
                </div>
                <div class="p-3 tab-pane fade" id="nav-modal-jbiu-camera-tab" role="tabpanel" aria-labelledby="nav-modal-jbiu-camera">
                  Camera
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
    $('body').append($modal);

    // add event listener
    this.getModal().on('hidden.bs.modal', () => {
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

(function($) {

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
  
    self.fetchFileData = async(file) => {
      const imgData = await readFile(file);
      self.fileData = imgData;
  
      return imgData;
    }
  
    self.uploadFile = async(file) => {
      const fileData = await self.fetchFileData(file);
      const formData = new FormData();
      // const cdnUrl = 'https://devcdn.istiqlalhouston.org/';
      const cdnUrl = 'http://localhost:3000/';

      formData.append('image', file);

      const imageAjax = $.ajax({
        url: cdnUrl,
        type: 'POST',
        data: formData,
        dataType: 'json',
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false
      });

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