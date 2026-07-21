# Fail-safe blood component workflow

`POST /api/allocation-workflows` performs conservative local screening of recorded eligibility, identity, testing, quarantine release, expiry, cold-chain state, exact ABO/Rh match, and trace events. An `Idempotency-Key` is mandatory. A cleared record still requires two distinct qualified verifiers; the terminal local state is `allocated_pending_hospital_ack`, not transfusion authorization. Every transition is tenant-scoped, version-checked, and audited.

Copy `.env.example`, run `scripts/bootstrap.sh`, provision the existing application schema, and run `scripts/migrate.sh`. `start.sh` does not install, create, migrate, seed, start PostgreSQL, or kill ports. Destructive synthetic seeding requires `CONFIRM_DESTRUCTIVE_DEMO_SEED=yes`.

This code is not clinically validated and must not direct patient care. Donor/clinical systems, analyzers, barcode scanners, cold-chain devices, hospital acknowledgements, notification providers, validated compatibility policies, regulatory retention, disaster recovery, and licensed professional verification remain required launch blockers.
