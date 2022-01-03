import React from 'react'
import {
  CAlert,
  CCard,
  CCol,
  CRow,
  CCardTitle,
  CCardHeader,
  CCardBody,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import Wizard from '../../../components/Wizard'
import WizardTableField from '../../../components/WizardTableField'
import PropTypes from 'prop-types'
import {
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormSelect,
  RFFCFormTextarea,
} from '../../../components/RFFComponents'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { OnChange } from 'react-final-form-listeners'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')
const AddPolicy = () => {
  const [intuneGetRequest, intuneTemplates] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ url: 'api/AddPolicy', values: values })
  }
  /* eslint-disable react/prop-types */
  const WhenFieldChanges = ({ field, set }) => (
    <Field name={set} subscription={{}}>
      {(
        // No subscription. We only use Field to get to the change function
        { input: { onChange } },
      ) => (
        <FormSpy subscription={{}}>
          {({ form }) => (
            <OnChange name={field}>
              {(value) => {
                let template = intuneTemplates.data.filter(function (obj) {
                  return obj.GUID === value
                })
                console.log(template[0][set])
                onChange(template[0][set])
              }}
            </OnChange>
          )}
        </FormSpy>
      )}
    </Field>
  )

  const formValues = {
    TemplateType: 'Admin',
  }

  return (
    <CCard className="page-card col-8">
      <CCardHeader>
        <CCardTitle className="text-primary">Add Intune policy</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <CRow className="row justify-content-center">
          <CCol xxl={12}>
            <Wizard initialValues={{ ...formValues }} onSubmit={handleSubmit}>
              <Wizard.Page
                title="Tenant Choice"
                description="Choose the tenants to create the policy for."
              >
                <center>
                  <h3 className="text-primary">Step 1</h3>
                  <h5 className="card-title mb-4">Choose tenants</h5>
                </center>
                <hr className="my-4" />
                <Field name="selectedTenants" validate={requiredArray}>
                  {(props) => (
                    <WizardTableField
                      keyField="defaultDomainName"
                      path="/api/ListTenants"
                      columns={[
                        {
                          name: 'Display Name',
                          selector: (row) => row['displayName'],
                          sortable: true,
                          exportselector: 'displayName',
                        },
                        {
                          name: 'Default Domain Name',
                          selector: (row) => row['defaultDomainName'],
                          sortable: true,
                          exportselector: 'mail',
                        },
                      ]}
                      fieldProps={props}
                    />
                  )}
                </Field>
                <Error name="selectedTenants" />
                <hr className="my-4" />
              </Wizard.Page>
              <Wizard.Page
                title="Select Options"
                description="Select which options you want to apply."
              >
                <center>
                  <h3 className="text-primary">Step 2</h3>
                  <h5 className="card-title mb-4">
                    Enter the raw JSON for this policy. See{' '}
                    <a href="https://cipp.app/EndpointManagement/IntunePolicyTemplates">this</a> for
                    more information.
                  </h5>
                </center>
                <hr className="my-4" />
                <CRow>
                  <CCol md={12}>
                    {intuneTemplates.isUninitialized &&
                      intuneGetRequest({ url: 'api/ListIntuneTemplates' })}
                    {intuneTemplates.isSuccess && (
                      <RFFCFormSelect
                        name="TemplateList"
                        values={intuneTemplates.data?.map((template) => ({
                          value: template.GUID,
                          label: template.Displayname,
                        }))}
                        placeholder="Select a template"
                        label="Please choose a template to apply, or enter the information manually."
                      />
                    )}
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <RFFCFormSelect
                      name="Type"
                      label="Select Policy Type"
                      placeholder="Select a template type"
                      values={[
                        { label: 'Administrative Template', value: 'Admin' },
                        { label: 'Settings Catalog', value: 'Catalog' },
                        { label: 'Custom Configuration', value: 'Device' },
                      ]}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={12}>
                    <RFFCFormInput
                      type="text"
                      name="Displayname"
                      label="Policy Display Name"
                      placeholder="Enter a name"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={12}>
                    <RFFCFormInput
                      type="text"
                      name="Description"
                      label="Description"
                      placeholder="leave blank for none"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={12}>
                    <RFFCFormTextarea
                      type="text"
                      name="RAWJson"
                      label="Raw JSON"
                      placeholder="Enter RAW JSON information"
                    />
                  </CCol>
                </CRow>
                <RFFCFormRadio value="" name="AssignTo" label="Do not assign"></RFFCFormRadio>
                <RFFCFormRadio
                  value="allLicensedUsers"
                  name="AssignTo"
                  label="Assign to all users"
                ></RFFCFormRadio>
                <RFFCFormRadio
                  value="AllDevices"
                  name="AssignTo"
                  label="Assign to all devices"
                ></RFFCFormRadio>
                <RFFCFormRadio
                  value="AllDevicesAndUsers"
                  name="AssignTo"
                  label="Assign to all users and devices"
                ></RFFCFormRadio>
                <hr className="my-4" />
                <WhenFieldChanges field="TemplateList" set="Description" />
                <WhenFieldChanges field="TemplateList" set="Displayname" />
                <WhenFieldChanges field="TemplateList" set="RAWJson" />
                <WhenFieldChanges field="TemplateList" set="Type" />
              </Wizard.Page>
              <Wizard.Page title="Review and Confirm" description="Confirm the settings to apply">
                <center>
                  <h3 className="text-primary">Step 3</h3>
                  <h5 className="card-title mb-4">Confirm and apply</h5>
                </center>
                <hr className="my-4" />
                {!postResults.isSuccess && (
                  <FormSpy>
                    {(props) => {
                      /* eslint-disable react/prop-types */
                      return (
                        <>
                          <CRow>
                            <CCol md={3}></CCol>
                            <CCol md={6}>
                              <CListGroup flush>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Display Name: {props.values.Displayname}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.Displayname ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Description: {props.values.Description}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.Description ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Type: {props.values.Type}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.Type ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                                <CListGroupItem className="d-flex justify-content-between align-items-center">
                                  Assign to: {props.values.AssignTo}
                                  <FontAwesomeIcon
                                    color="#f77f00"
                                    size="lg"
                                    icon={props.values.AssignTo ? faCheckCircle : faTimesCircle}
                                  />
                                </CListGroupItem>
                              </CListGroup>
                            </CCol>
                          </CRow>
                        </>
                      )
                    }}
                  </FormSpy>
                )}
                {postResults.isSuccess && (
                  <CAlert color="success">{postResults.data?.Results}</CAlert>
                )}
                <hr className="my-4" />
              </Wizard.Page>
            </Wizard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default AddPolicy
