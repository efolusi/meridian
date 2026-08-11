import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '../components/files/Attachment.jsx';
import { Button, buttonVariants } from '../components/forms/Button.jsx';

describe('Attachment compatibility contract', () => {
  it('uses documented defaults and forwards every slot ref', () => {
    const root = React.createRef();
    const media = React.createRef();
    const content = React.createRef();
    const title = React.createRef();
    const description = React.createRef();
    render(
      <Attachment ref={root}>
        <AttachmentMedia ref={media}>PDF</AttachmentMedia>
        <AttachmentContent ref={content}>
          <AttachmentTitle ref={title}>report.pdf</AttachmentTitle>
          <AttachmentDescription ref={description}>PDF · 2 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>,
    );
    expect(root.current.dataset.state).toBe('done');
    expect(root.current.dataset.size).toBe('default');
    expect(root.current.dataset.orientation).toBe('horizontal');
    expect(media.current.dataset.variant).toBe('icon');
    expect(content.current.classList.contains('ef-attachment__content')).toBe(true);
    expect(title.current.textContent).toBe('report.pdf');
    expect(description.current.textContent).toBe('PDF · 2 MB');
  });

  it('exposes state, size, orientation, and image media contracts', () => {
    render(<Attachment state="error" size="xs" orientation="vertical"><AttachmentMedia variant="image"><img alt="Preview" /></AttachmentMedia></Attachment>);
    const root = screen.getByRole('img').closest('.ef-attachment');
    expect(root.dataset.state).toBe('error');
    expect(root.dataset.size).toBe('xs');
    expect(root.dataset.orientation).toBe('vertical');
    expect(screen.getByRole('img').parentElement.dataset.variant).toBe('image');
  });

  it('keeps the full-card trigger and actions independently operable', () => {
    const open = vi.fn();
    const remove = vi.fn();
    render(
      <Attachment>
        <AttachmentContent><AttachmentTitle>report.pdf</AttachmentTitle></AttachmentContent>
        <AttachmentActions><AttachmentAction aria-label="Remove report.pdf" onClick={remove}>×</AttachmentAction></AttachmentActions>
        <AttachmentTrigger aria-label="Open report.pdf" onClick={open} />
      </Attachment>,
    );
    const action = screen.getByRole('button', { name: 'Remove report.pdf' });
    expect(action.classList.contains('ef-btn--icon-xs')).toBe(true);
    fireEvent.click(action);
    fireEvent.click(screen.getByRole('button', { name: 'Open report.pdf' }));
    expect(remove).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledOnce();
  });

  it('supports polymorphic triggers and scrollable groups', () => {
    const triggerRef = React.createRef();
    const groupRef = React.createRef();
    render(
      <AttachmentGroup ref={groupRef} tabIndex={0} role="group" aria-label="Files">
        <Attachment><AttachmentTrigger ref={triggerRef} render={<a href="/report.pdf" aria-label="Open report" />} /></Attachment>
      </AttachmentGroup>,
    );
    expect(screen.getByRole('link', { name: 'Open report' }).getAttribute('href')).toBe('/report.pdf');
    expect(triggerRef.current).toBe(screen.getByRole('link', { name: 'Open report' }));
    expect(groupRef.current.classList.contains('ef-attachment-group')).toBe(true);
  });
});

describe('Button dependency contract', () => {
  it('supports documented variants, sizes, helper export, and refs while retaining aliases', () => {
    const ref = React.createRef();
    render(<Button ref={ref} variant="destructive" size="icon-sm" aria-label="Delete" />);
    expect(ref.current.classList.contains('ef-btn--destructive')).toBe(true);
    expect(ref.current.classList.contains('ef-btn--icon-sm')).toBe(true);
    expect(buttonVariants()).toBe('ef-btn ef-btn--primary ef-btn--md');
    expect(buttonVariants({ variant: 'primary', size: 'md' })).toBe('ef-btn ef-btn--primary ef-btn--md');
  });
});
