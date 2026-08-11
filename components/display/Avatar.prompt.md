Composable identity image with fallback, status badge, named sizes, and overlapping groups. The legacy `name`, `src`, and numeric `size` shortcuts remain supported.

```jsx
<Avatar size="lg"><AvatarImage src={user.photo} alt={user.name} /><AvatarFallback>AO</AvatarFallback><AvatarBadge /></Avatar>
<AvatarGroup><Avatar name="Ada Obi" /><Avatar name="Femi Alade" /><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup>
```
