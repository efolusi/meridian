import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/navigation/Breadcrumbs.jsx';

describe('Breadcrumb compatibility contract', () => {
  it('renders the complete semantic composition', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/docs">Docs</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    const navigation = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(navigation.getAttribute('data-slot')).toBe('breadcrumb');
    expect(within(navigation).getByRole('list').tagName).toBe('OL');
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs');
    expect(screen.getByRole('link', { name: 'Components' }).getAttribute('aria-current')).toBe('page');
  });

  it('supports semantic link composition through asChild', () => {
    render(<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><button type="button">Open docs</button></BreadcrumbLink></BreadcrumbItem></BreadcrumbList></Breadcrumb>);
    const link = screen.getByRole('button', { name: 'Open docs' });
    expect(link.tagName).toBe('BUTTON');
    expect(link.getAttribute('data-slot')).toBe('breadcrumb-link');
    expect(link.className).toContain('ef-breadcrumb__link');
  });

  it('provides decorative default/custom separators and ellipsis', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbEllipsis data-testid="ellipsis" /></BreadcrumbItem>
          <BreadcrumbSeparator data-testid="default-separator" />
          <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>
          <BreadcrumbSeparator data-testid="custom-separator">/</BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    for (const id of ['ellipsis', 'default-separator', 'custom-separator']) {
      const element = screen.getByTestId(id);
      expect(element.getAttribute('role')).toBe('presentation');
      expect(element.getAttribute('aria-hidden')).toBe('true');
    }
    expect(screen.getByTestId('custom-separator').textContent).toBe('/');
  });

  it('forwards native props, classes, styles, and refs on every part', () => {
    const refs = Array.from({ length: 7 }, () => React.createRef());
    render(
      <Breadcrumb ref={refs[0]} aria-label="Project path" className="root-class">
        <BreadcrumbList ref={refs[1]} className="list-class">
          <BreadcrumbItem ref={refs[2]} className="item-class">
            <BreadcrumbLink ref={refs[3]} href="#" style={{ color: 'currentcolor' }}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator ref={refs[4]} />
          <BreadcrumbItem><BreadcrumbPage ref={refs[5]}>Current</BreadcrumbPage></BreadcrumbItem>
          <BreadcrumbItem><BreadcrumbEllipsis ref={refs[6]} /></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(refs.every(entry => entry.current instanceof HTMLElement)).toBe(true);
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Project path');
    expect(refs[0].current.className).toContain('root-class');
    expect(refs[1].current.className).toContain('list-class');
    expect(refs[2].current.className).toContain('item-class');
    expect(refs[3].current.style.color).toBe('currentcolor');
  });

});
