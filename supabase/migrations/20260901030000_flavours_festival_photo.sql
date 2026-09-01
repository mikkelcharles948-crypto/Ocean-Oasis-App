-- The only previously-available photo for this event was a 2.8MB flyer PNG,
-- deliberately left out given the app's image-load-reliability issues. This
-- is a real, lightweight (~47KB) news photo of the festival instead.
update public.events
set image_url = 'https://content.wicnews.com/production/media/21374/01KX0NA23F1DF8QR3Z12QBW358.jpg'
where id = 'e_14';
