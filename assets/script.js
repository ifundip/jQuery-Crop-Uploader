(function($) {
  $.fn.imageManagement = function() {
    const self = this;
    const $elem = $(this);
    const $addInput = $elem.find('.image-add');

    // custom functions
    self.resetInput = () => {
      $addInput.value = '';
    }

    self.uploadFile = file => {
      const formData = new FormData();
      const cdnUrl = 'https://devcdn.istiqlalhouston.org/';

      formData.append('image', file);

      $.ajax({
        url: cdnUrl,
        type: 'POST',
        data: formData,
        dataType: 'json',
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        cache: false,
        success: function(res) {
          console.log(res);
        },
        error: function(err) {
          console.warn(err);
        },
        complete: function() {
          console.log('Complete');
        }
      });
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
        self.uploadFile(file);
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