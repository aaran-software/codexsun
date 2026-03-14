# Codexsun - Repository Structure

```text
codexsun/
|
|-- ASSIST/                              <- Project control
|
|-- CxAppHost/                           <- .NET Aspire orchestrator
|
|-- cxcore/                              <- Shared domain
|   `-- Domain/
|       |-- Common/
|       |-- Users/
|       |-- Roles/
|       |-- Customers/
|       |-- Contacts/
|       |-- Suppliers/
|       |-- Staff/
|       |-- Vendors/
|       |-- Addresses/
|       |-- Cities/
|       |-- States/
|       `-- CXCore/
|           |-- Common/
|           |-- Address/
|           |-- Shared/
|           `-- Master/
|
|-- cxlib/                               <- Shared contracts and utilities
|
|-- cxbilling/                           <- Billing domain
|-- cxmarketing/                         <- Marketing domain
|-- cxanalytics/                         <- Analytics domain
|
|-- cxserver/                            <- API layer
|   |-- Middleware/
|   |-- Infrastructure/
|   `-- Modules/
|       |-- Auth/
|       |-- Admin/
|       |-- VendorDashboard/
|       `-- CXCore/
|           |-- Common/
|           |-- Address/
|           |-- Shared/
|           `-- Master/
|
|-- cxstore/                             <- React frontend
|   `-- src/
|       |-- api/
|       |-- components/
|       |   |-- admin/
|       |   `-- table/
|       |-- pages/
|       |   `-- admin/
|       |       |-- common/
|       |       `-- master/
|       |-- state/
|       |-- hooks/
|       `-- types/
|
`-- Codexsun.slnx
```