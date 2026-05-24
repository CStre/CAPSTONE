import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInForm } from './SignInForm';

describe('SignInForm', () => {
  it('submits the entered email and password', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn<(email: string, password: string) => void>();

    render(
      <SignInForm
        initialEmail=""
        pending={false}
        error={null}
        onSubmit={onSubmit}
        onSwitchToSignUp={jest.fn<() => void>()}
      />,
    );

    await user.type(screen.getByLabelText('Email'), 'traveler@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter2pass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledWith('traveler@example.com', 'hunter2pass');
  });
});
