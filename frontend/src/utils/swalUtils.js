import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Standard Configuration for RLYFE Theme
const toastMixin = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/**
 * Show a success notification (Toast or Center Alert)
 * @param {string} title - Main message
 * @param {string} text - (Optional) Detail text
 * @param {boolean} isToast - (Default: false) Show as toast?
 */
export const showSuccess = (title, text = '', isToast = false) => {
    if (isToast) {
        return toastMixin.fire({
            icon: 'success',
            title: title
        });
    }
    return MySwal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonColor: '#10b981', // Emerald 500
        confirmButtonText: 'Great!'
    });
};

/**
 * Show an error notification
 * @param {string} title - Error title
 * @param {string} text - Error details
 */
export const showError = (title, text = '') => {
    return MySwal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#ef4444', // Red 500
        confirmButtonText: 'Okay'
    });
};

/**
 * Show a confirmation dialog (e.g., Delete actions)
 * @param {string} title - Question
 * @param {string} text - Warning detail
 * @param {string} confirmText - Button text (Default: 'Yes, do it!')
 * @returns {Promise<boolean>} - Resolves to true if confirmed
 */
export const showConfirm = async (title, text, confirmText = 'Yes, do it!') => {
    const result = await MySwal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmText
    });
    return result.isConfirmed;
};

export default MySwal;
