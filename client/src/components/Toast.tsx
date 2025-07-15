import { Toaster } from 'sonner'

const Toast = () => {
    return (
        <Toaster
            position='top-center'
            duration={5000}
            richColors
        />
    );
};

export default Toast;