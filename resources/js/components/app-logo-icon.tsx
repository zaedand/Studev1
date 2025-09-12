import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/studev.png"   // ganti sesuai nama file di public/
            alt="StuDev Logo"
        />
    );
}
