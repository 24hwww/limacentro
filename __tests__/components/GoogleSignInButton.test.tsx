import { render, screen, fireEvent } from '@testing-library/react';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { signIn } from "next-auth/react";

// Mock next-auth
jest.mock("next-auth/react", () => ({
    signIn: jest.fn(),
}));

describe('GoogleSignInButton', () => {
    it('renders correctly and calls signIn on click', async () => {
        render(<GoogleSignInButton />);

        const button = screen.getByRole('button', { name: /ingresar con google/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);

        expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
    });
});
