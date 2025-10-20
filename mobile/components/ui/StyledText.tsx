import { Text as RNTExt, TextProps as RNTextProps } from 'react-native';

type FontVariant =
	| 'lexend-thin'
	| 'lexend-extralight'
	| 'lexend-light'
	| 'lexend'
	| 'lexend-medium'
	| 'lexend-semibold'
	| 'lexend-bold'
	| 'lexend-extrabold'
	| 'lexend-black';

interface StyledTextProps extends RNTextProps {
    variant?: FontVariant;
}

const FONT_MAP: Record<FontVariant, string> = {
    'lexend-thin': 'Lexend_100Thin',
    'lexend-extralight': 'Lexend_200ExtraLight',
    'lexend-light': 'Lexend_300Light',
    'lexend': 'Lexend_400Regular',
    'lexend-medium': 'Lexend_500Medium',
    'lexend-semibold': 'Lexend_600SemiBold',
    'lexend-bold': 'Lexend_700Bold',
    'lexend-extrabold': 'Lexend_800ExtraBold',
    'lexend-black': 'Lexend_900Black',
}

export default function StyledText({
    variant = 'lexend',
    style,
    children,
    ...props
}: StyledTextProps) {
    return (
        <RNTExt {...props} style={[{ fontFamily: FONT_MAP[variant] }, style]}>
            {children}
        </RNTExt>
    )
}