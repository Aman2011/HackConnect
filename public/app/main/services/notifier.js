angular.module('app').value('Toastr', toastr);

angular.module('app').factory('notifier', function(Toastr) {
    Toastr.options = {
        "closeButton": true,
        "positionClass": "toast-bottom-left",
    }
    return {
        notify: function(msg) {
            Toastr.info(msg);
            console.log(msg);
        },
        success: function (msg) {
            Toastr.success(msg);
        },
        error: function (msg) {
            Toastr.error(msg);
        }
    }
})