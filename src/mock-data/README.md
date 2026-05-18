# /mock-data — Backend simulation fixtures

These files are the "seeded database" the mock services hand out. They
re-export the typed seeds from `/data` and add backend-only fixtures
(portfolio snapshots, wallet histories, etc.).

Components never import from this folder. Only `/services` and `/store`
read from here.
