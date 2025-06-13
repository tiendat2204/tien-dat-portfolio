'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

export type Social = {
    icon: string; // Changed from name to icon
    image: string;
    url?: string;
};

interface AnimatedSocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
    socials: Social[];
}

const AnimatedSocialLinks = React.forwardRef<
    HTMLDivElement,
    AnimatedSocialLinksProps
>(({ socials, className, ...props }, ref) => {
    const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
    const [rotation, setRotation] = useState<number>(0);
    const [cliked, setCliked] = useState<boolean>(false);

    const animation = {
        scale: cliked ? [1, 1.3, 1] : 1,
        transition: { duration: 0.3 },
    };

    useEffect(() => {
        const handleClick = () => {
            setCliked(true);
            setTimeout(() => {
                setCliked(false);
            }, 200);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [cliked]);

    return (
        <div
            ref={ref}
            className="flex items-center justify-center gap-0"
            {...props}
        >
            {socials.map((social, index) => (
                <div
                    className={`relative cursor-pointer py-2 px-2 sm:px-4 transition-opacity duration-200 ${
                        hoveredSocial && hoveredSocial !== social.icon
                            ? 'opacity-50'
                            : 'opacity-100'
                    }`}
                    key={index}
                    onMouseEnter={() => {
                        setHoveredSocial(social.icon);
                        setRotation(Math.random() * 20 - 10);
                    }}
                    onMouseLeave={() => setHoveredSocial(null)}
                    onClick={() => {
                        setCliked(true);
                        if (social.url) {
                            window.open(social.url, '_blank');
                        }
                    }}
                >
                    {social.icon && (
                        <Image
                            src={`/icons/${social.icon}`}
                            alt={social.icon}
                            width={25}
                            height={25}
                            className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                        />
                    )}
                    <AnimatePresence>
                        {hoveredSocial === social.icon && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 flex h-full w-full items-center justify-center"
                                animate={animation}
                            >
                                <motion.img
                                    key={social.icon}
                                    src={social.image}
                                    alt={social.icon}
                                    className="size-12 sm:size-16"
                                    initial={{
                                        y: -40,
                                        rotate: rotation,
                                        opacity: 0,
                                        filter: 'blur(2px)',
                                    }}
                                    animate={{ y: -50, opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ y: -40, opacity: 0, filter: 'blur(2px)' }}
                                    transition={{ duration: 0.2 }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
});

AnimatedSocialLinks.displayName = 'AnimatedSocialLinks';

export default AnimatedSocialLinks;