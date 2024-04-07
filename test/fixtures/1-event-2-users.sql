INSERT INTO user (id, username, password, email, firstName, lastName, profile_id)
VALUES (1, 'testuser', '$2b$10$xBrnUBbMMd2auMLD6zV72u6GUS2eZjaHWdhcGvBFZrx7/ZoROmbpa', 'test@user.com', 'Test',
        'User', null);

INSERT INTO user (id, username, password, email, firstName, lastName, profile_id)
VALUES (2, 'testuser2', '$2b$10$xBrnUBbMMd2auMLD6zV72u6GUS2eZjaHWdhcGvBFZrx7/ZoROmbpa', 'test2@user.com', 'Test',
        'User', null);

INSERT INTO event (id, name, description, `when`, address, organizer_id)
VALUES (1, 'Test event', 'test description', '2024-04-07 03:00:00', 'Some address', 1);

