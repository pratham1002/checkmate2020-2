function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    localStorage.setItem("cr", false);
    localStorage.setItem("ttt", false);
    localStorage.setItem("mm", false);
  }
  
  
  $("#submit").click(function (event) {
      event.preventDefault();
      $("#submit").val('Registering...')
      $("#submit").attr('disabled','disabled');

      const body = {
        "username": `${$("#username").val()}`,
        "password": `${$("#password").val()}`,
        "id_1": `${$("#id_1").val()}`
      };

      $.ajax({
          url: "/register",
          method: 'POST',
          data: body,
          success: function(response){
              const jwt = response["token"] ;
              if (jwt!==null) {
                document.getElementsByClassName('message')[0].innerHTML="Success"
                document.getElementsByClassName('message')[0].style.display='block'
                document.getElementsByClassName('message')[0].style.background='whitesmoke'
                document.getElementsByClassName('message')[0].style.color='black'
                document.getElementsByClassName('message')[0].style.borderColor='whitesmoke'
                  setCookie("jwt", jwt, 1);
                  window.location.href = window.location.origin + "/game"
              }else {
                  submit(true,true)
              }
          },
          error : function (error) {
              submit(false,false)
          }
        });
      document.getElementById("submit").disable = false ;
      }
  ) ;
  function submit(success,error){
    var username=document.getElementsByClassName('input')[1].value
    var password=document.getElementsByClassName('input')[2].value
    var bits_id=document.getElementsByClassName('input')[0].value
    Arr=[]
    if(username=='' || password=='' || bits_id==''){
        if(username==''){
            Arr.push(1)
        }
        if(bits_id==''){
            Arr.push(0)
        }
        if(password==''){
            Arr.push(2)
        }
        for(var i=0;i<Arr.length;i++){
            document.getElementsByClassName('input')[i].style.borderColor='red'
        }
        if(Arr.length==3){
            document.getElementsByClassName('message')[0].innerHTML='You can\'t leave everything empty'
            document.getElementsByClassName('message')[0].style.display='block'
        }
        else{
            document.getElementsByClassName('message')[0].innerHTML='You can\'t leave a field empty'
            document.getElementsByClassName('message')[0].style.display='block'
        }
        setTimeout(function(){
            for(var i=0;i<Arr.length;i++){
                document.getElementsByClassName('input')[i].style.borderColor='whitesmoke'
            }

        },2000)
    }
    else if(!success){
        document.getElementsByClassName('input')[1].style.borderColor='red'
        document.getElementsByClassName('input')[0].style.borderColor='red'
        document.getElementsByClassName('input')[2].style.borderColor='red'
        document.getElementsByClassName('message')[0].innerHTML="Invalid data/username/id"
        document.getElementsByClassName('message')[0].style.display='block'
        setTimeout(function(){
            document.getElementsByClassName('input')[1].style.borderColor='whitesmoke'
            document.getElementsByClassName('input')[0].style.borderColor='whitesmoke'
            document.getElementsByClassName('input')[2].style.borderColor='whitesmoke'
        },2000)
    }
    else if (error){
        console.log('Error')
    }
   
}