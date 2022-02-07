const paddleOne = document.getElementById('paddleOne')
const theField = document.getElementById('theField')




document.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
        console.log('heyUp');
        paddleOne.style.top = Math.max(paddleOne.getBoundingClientRect().top - 23.9  ) + "px"  
        // paddleOne.getBoundingClientRect() = paddleOne.getBoundingClientRect()  
    }

    if (event.key === 'ArrowDown') {
        console.log('heyDown');
        paddleOne.style.top = Math.max(theField.getBoundingClientRect().top, paddleOne.getBoundingClientRect().top + 23.9  ) + "px"  
    }
        
    
})