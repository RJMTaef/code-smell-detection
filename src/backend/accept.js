document.addEventListener("DOMContentLoaded", () =>{
    //add event listener to Accept button
    const acceptButton = document.getElementById("accept");
    acceptButton.addEventListener("click", () => {
        acceptSuggestion();
    });
});
//this function is untested because gemini is overloaded and will not generate code and in turn will not open
//the code mirror panel I need to see.
//https://stackoverflow.com/questions/23923314/onclick-replace-javascript-element-with-new-javascript-element
function acceptSuggestion(){
    //replace initial code with generated suggested code
    var element = document.getElementById("refactoredCode").innerHTML;
    var replace = element.replace({refactoredCode}, {generated});
    document.getElementById("refactoredCode").innerHTML = replace;
  }
