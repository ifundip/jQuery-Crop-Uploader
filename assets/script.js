(function($) {
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

  $.fn.imageCropping = async function(file, appendFile) {
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
      appendFile(imageFile);
      self.close();
    }

    // handlers
    $btnCancel.click(self.close);
    $btnUpload.click(self.upload);

    return self;
  }

  $.fn.imageBlock = function(file) {
    const self = this;
    const $elem = $(this);
    const $img = $('<img/>');
    const $btnCancel = $('<div class="btn btn-danger image-block__cancel">Cancel</div>');
    const $btnDelete = $('<div class="btn btn-danger image-block__delete">Delete</div>');
    const $progress = $(`<div class="image-block__progress progress"></div>`);
    const $progressBar = $('<div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>');

    // attributes
    self.progress = 0;
    self.xhr = null;
    self.fileData = null;

    // methods
    self.setProgress = percentage => {
      $progressBar
      .css({
        width: `${percentage}%`,
      });
    }

    self.updateProgress = e => {
      if(e.lengthComputable){
        const max = e.total;
        const current = e.loaded;
        const percentage = (current * 100) / max;

        self.progress = percentage;
        self.setProgress(percentage);

        if (percentage == 100)
          $btnCancel.hide();
      }
    }

    self.prepareFileData = async(file) => {
      const imgData = await readFile(file);
      self.fileData = imgData;

      return imgData;
    }

    self.delete = () => {
      self.cancelUpload();
      $(this).remove();
    }

    self.cancelUpload = () => {
      self.xhr.abort();
      self.setProgress(0);
    }

    self.upload = file => {
      const formData = new FormData();
      // const cdnUrl = 'https://devcdn.istiqlalhouston.org/';
      const cdnUrl = 'http://localhost:3000/';

      formData.append('image', file);
      formData.append('lg', [100, 100]);

      self.xhr = $.ajax({
        url: cdnUrl,
        type: 'POST',
        data: formData,
        dataType: 'json',
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        xhr: function() {
          const myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
            myXhr.upload.addEventListener('progress', self.updateProgress, false);
          }
          return myXhr;
        },
        success: function(data) {
          // $progress.text(JSON.stringify(data));
        },
        error: function(err) {
          console.warn(err);
        }
      });
    }

    self.prepareElement = () => {
      const $row = $('<table style="width: 100%"><tbody><tr></tr></tbody></table>');
      const $imgElem = $('<td width="150" style="text-align: center;"></td>');
      const $detailElem = $('<td></td>');
      const $progressElem = $('<div></div>');
      const $btnsElem = $('<div></div>');

      $imgElem.append($img);
      $progress.append($progressBar);
      $progressElem.append($progress);

      $btnsElem.append($btnCancel);
      $btnsElem.append($btnDelete);

      $detailElem.append($progressElem);
      $detailElem.append($btnsElem);

      $row.find('tr').append($imgElem);
      $row.find('tr').append($detailElem);

      $elem.append($row);
    }

    // handlers
    $btnCancel.click(self.cancelUpload);
    $btnDelete.click(self.delete);

    // constructor
    self.file = file;
    self.prepareElement();
    self.prepareFileData(file)
      .then(data => {
        $img.attr('src', data);
      });
    self.upload(file);
  }

  $.fn.imageManagement = function() {
    const self = this;
    const $elem = $(this);
    const $addInput = $elem.find('.image-add');
    const $imageList = $elem.find('.image-list');
    const $imageCrop = $('#image-cropping');

    // attributes
    self.activeCrop = null;

    // custom functions
    self.resetInput = () => {
      $addInput.val('');
    }

    self.appendFile = file => {
      // const newImageBlock = document.createElement('div');
      const $newImageBlock = $(`<div class='image-block'></div>`);

      $imageList.append($newImageBlock);
      $newImageBlock.imageBlock(file);
    }

    self.cropImage = async(file) => {
      const $imageCropInside = $('<div></div>');
      $imageCrop.html('');
      $imageCrop.append($imageCropInside);
      const ic = await $imageCropInside.imageCropping(file, self.appendFile);
      console.log(ic);
    }

    self.uploads = (files = []) => {
      if (files.length === 1) {
        self.cropImage(files[0]);
        return;
      }
      $.each(files, (i, file) => {
        self.appendFile(file);
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

$(document).ready(function() {
  $('#n-image-management').imageManagement();
});