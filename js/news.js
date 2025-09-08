// newsletter 
document.getElementById('newsForm')?.addEventListener('submit', e => {
    e.preventDefault();
    Swal.fire({
        icon: 'success',
        title: '¡Listo!',
        text: 'Te suscribiste a nuestra newsletter.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
    });
    e.target.reset();
});