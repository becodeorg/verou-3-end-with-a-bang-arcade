const paddleOne = document.getElementById('paddleOne')





document.addEventListener('keydown', event => {
    if (event.key === 'ArrowUp') {
        console.log('heyUp');
        paddleOne.style.top = Math.max(paddleOne.getBoundingClientRect().top - 10  ) + "px"  

    }
    if (event.key === 'ArrowDown') {
        console.log('heyDown');
        paddleOne.style.top = Math.max(paddleOne.getBoundingClientRect().top + 10  ) + "px"  
    }
        
    
})