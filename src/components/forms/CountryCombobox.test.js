import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CountryCombobox from './CountryCombobox';

function Harness({ initial = 'US' }) {
  const [value, setValue] = useState(initial);
  const [other, setOther] = useState('');
  return (
    <>
      <CountryCombobox id="c" value={value} onChange={setValue} otherName={other} onOtherNameChange={setOther} />
      <output data-testid="value">{value}|{other}</output>
    </>
  );
}

describe('CountryCombobox', () => {
  it('shows the pre-selected country', () => {
    render(<Harness />);
    expect(screen.getByRole('combobox')).toHaveValue('United States');
  });

  it('filters as you type and picks with the keyboard', () => {
    render(<Harness />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'ire' } });
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Ireland');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByTestId('value')).toHaveTextContent('IE|');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('offers "My country isn\'t listed" and asks for the name', () => {
    render(<Harness />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('option', { name: /isn't listed/i }));
    expect(screen.getByText(/don't have brands shipping there yet/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/which country are you in/i), { target: { value: 'Brazil' } });
    expect(screen.getByTestId('value')).toHaveTextContent('OTHER|Brazil');
  });

  it('closes on Escape without changing the value', () => {
    render(<Harness initial="GB" />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('value')).toHaveTextContent('GB|');
  });

  it('keeps a typed country when they click away without picking a row', () => {
    render(<><Harness /><button type="button">Continue</button></>);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'France' } });
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByTestId('value')).toHaveTextContent('FR|');
  });

  it('keeps a typed country when focus leaves the field', () => {
    render(<Harness />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.blur(input);
    expect(screen.getByTestId('value')).toHaveTextContent('FR|');
    expect(input).toHaveValue('France');
  });

  it('typing nothing keeps the current value', () => {
    render(<Harness initial="GB" />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(screen.getByTestId('value')).toHaveTextContent('GB|');
  });
});
