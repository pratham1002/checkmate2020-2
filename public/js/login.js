function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  
  $("#submit").click(function (event) {
      event.preventDefault();
      $("#submit").val('Verifying...') ;
      $("#submit").attr('disabled','disabled');
      const body = {
        username: `${$("#username").val()}`,
        password: `${$("#password").val()}`
      };
  
      $.ajax({
          url: "/login",
          method: 'POST',
          data: body,
          success: function(reponse){
              const jwt = reponse["token"]
              if (jwt!==null) {
                  document.getElementsByClassName('message')[0].innerHTML="Success"
                  document.getElementsByClassName('message')[0].style.display='block'
                  document.getElementsByClassName('message')[0].style.background='whitesmoke'
                  document.getElementsByClassName('message')[0].style.color='black'
                  document.getElementsByClassName('message')[0].style.borderColor='whitesmoke'
                  setCookie("jwt", jwt, 1);
                  window.location.href = window.location.origin + "/game"
              } else {
                  submit(true,true)
              }
          },
          error : function () {
              submit(false,false)
          }
        });
      }
  ) ;
function submit(success,error){
    var username=document.getElementsByClassName('input')[0].value
    var password=document.getElementsByClassName('input')[1].value
    if(username==''&&password==''){
        document.getElementsByClassName('input')[1].style.borderColor='red'
        document.getElementsByClassName('input')[0].style.borderColor='red'

        document.getElementsByClassName('message')[0].innerHTML="Username and Password can't be Empty"
        document.getElementsByClassName('message')[0].style.display='block'
        setTimeout(function(){
            document.getElementsByClassName('input')[0].style.borderColor='whitesmoke'
            document.getElementsByClassName('input')[1].style.borderColor='whitesmoke'

        },2000)
    }
    else if(username==''){
        document.getElementsByClassName('input')[0].style.borderColor='red'
        document.getElementsByClassName('message')[0].innerHTML="Username can't be Empty"
        document.getElementsByClassName('message')[0].style.display='block'
        setTimeout(function(){
            document.getElementsByClassName('input')[0].style.borderColor='whitesmoke'
        },2000)

    }
    else if(password==''){
        document.getElementsByClassName('input')[1].style.borderColor='red'
        document.getElementsByClassName('message')[0].innerHTML="Password can't be Empty"
        document.getElementsByClassName('message')[0].style.display='block'
        setTimeout(function(){
            document.getElementsByClassName('input')[1].style.borderColor='whitesmoke'
        },2000)
    }
    else if(!success){
        document.getElementsByClassName('input')[1].style.borderColor='red'
        document.getElementsByClassName('input')[0].style.borderColor='red'

        document.getElementsByClassName('message')[0].innerHTML="Invalid credentials"
        document.getElementsByClassName('message')[0].style.display='block'
        setTimeout(function(){
            document.getElementsByClassName('input')[1].style.borderColor='whitesmoke'
            document.getElementsByClassName('input')[0].style.borderColor='whitesmoke'

        },2000)
    }
    else if (error){
        console.log('Error')
    }
}