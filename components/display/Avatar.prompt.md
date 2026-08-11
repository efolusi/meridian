Compose identity images explicitly from image, fallback, badge, and group parts. Avatar supports the `default`, `sm`, and `lg` sizes.

```jsx
<Avatar size="lg"><AvatarImage src={user.photo} alt={user.name} /><AvatarFallback>AO</AvatarFallback><AvatarBadge /></Avatar>
<AvatarGroup><Avatar><AvatarFallback>AO</AvatarFallback></Avatar><Avatar><AvatarFallback>FA</AvatarFallback></Avatar><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup>
```
