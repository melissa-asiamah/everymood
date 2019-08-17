var trash = document.getElementsByClassName("fa-trash-alt");



Array.from(trash).forEach(function(element) {
    element.addEventListener('click', function(){
      fetch('/deleteChat', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: element.id
        })
      }).then(function (response) {
        window.location.reload()
      })
    });
});
