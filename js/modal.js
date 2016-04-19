function setModal(state,mystr){
	switch(state){
		case 'show':
			$('#modal p').html(mystr);
			$('#modal').modal('show');
			break;
		case 'hide':
			$('#modal p').html(mystr);
      		setTimeout(function() {
        		$('#modal').modal('hide');
      		},1000);
			break;
	}
}