(function($) {
  $.fn.imageBlock = function(file) {
    const self = this;
    const $elem = $(this);
    const $progress = $('<div class="image-block__progress"></div>');
    const $btnCancel = $('<div class="btn btn-danger image-block__cancel">Cancel</div>');

    // attributes
    self.progress = 0;
    self.xhr = null;

    // methods
    self.updateProgress = e => {
      if(e.lengthComputable){
        const max = e.total;
        const current = e.loaded;
        const percentage = (current * 100) / max;

        self.progress = percentage;

        $progress.text(percentage + '%');
      }
    }

    self.cancelUpload = () => {
      self.xhr.abort();
    }

    self.upload = file => {
      const formData = new FormData();
      const cdnUrl = 'https://devcdn.istiqlalhouston.org/';

      formData.append('image', file);

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
          $progress.text(JSON.stringify(data));
        },
        error: function(err) {
          $progress.text(JSON.stringify(err));
        }
      });
    }

    // handlers
    $btnCancel.click(self.cancelUpload);

    // constructor
    $elem.append($progress);
    $elem.append($btnCancel);
    self.file = file;
    self.upload(file);
  }

  $.fn.imageManagement = function() {
    const self = this;
    const $elem = $(this);
    const $addInput = $elem.find('.image-add');
    const $imageList = $elem.find('.image-list');

    // custom functions
    self.resetInput = () => {
      $addInput.value = '';
    }

    self.appendFile = file => {
      // const newImageBlock = document.createElement('div');
      const $newImageBlock = $(`<div class='image-block'></div>`);

      $imageList.append($newImageBlock);
      $newImageBlock.imageBlock(file);
    }

    self.readFile = file => {
      return new Promise(resolve => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          resolve(reader.result);
        }, false);
  
        reader.readAsDataURL(file);
      });
    }

    self.uploads = (files = []) => {
      $.each(files, async (i, file) => {
        const imgData = await self.readFile(file);
        self.appendFile(file);
      })
    }

    // button add handler
    $addInput.change(event => {
      const target = event.target;

      if (target.files && target.files[0]) {
        self.uploads(target.files);
        return;
      }
      self.resetInput();
    });
    
    return this;
  };
}(jQuery));

$(document).ready(function() {
  $('#n-image-management').imageManagement();
});