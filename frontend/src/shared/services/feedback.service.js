import api from "./client.js";

/*
|--------------------------------------------------------------------------
| ADMIN — FEEDBACK FORMS
|--------------------------------------------------------------------------
*/

// Get all feedback forms
export async function fetchFeedbackForms() {
  const response = await api.get("/feedback/forms");
  return response.data;
}

// Get one feedback form
export async function fetchFeedbackForm(formId) {
  const response = await api.get(
    `/feedback/forms/${formId}`
  );

  return response.data;
}

// Create feedback form
export async function createFeedbackForm(formData) {
  const response = await api.post(
    "/feedback/forms",
    formData
  );

  return response.data;
}

// Publish feedback form
export async function publishFeedbackForm(formId) {
  const response = await api.patch(
    `/feedback/forms/${formId}/publish`
  );

  return response.data;
}

// Close feedback form
export async function closeFeedbackForm(formId) {
  const response = await api.patch(
    `/feedback/forms/${formId}/close`
  );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| ADMIN — RESPONSES & ANALYTICS
|--------------------------------------------------------------------------
*/

// Get all responses for a form
export async function fetchFeedbackResponses(formId) {
  const response = await api.get(
    `/feedback/forms/${formId}/responses`
  );

  return response.data;
}

// Get statistics
export async function fetchFeedbackStatistics(formId) {
  const response = await api.get(
    `/feedback/forms/${formId}/statistics`
  );

  return response.data;
}

// Get response count
export async function fetchFeedbackResponseCount(formId) {
  const response = await api.get(
    `/feedback/forms/${formId}/response-count`
  );

  return response.data;
}


/*
|--------------------------------------------------------------------------
| STUDENT — ACTIVE FEEDBACK
|--------------------------------------------------------------------------
*/

// Get feedback forms visible to the current student (active + past cycles)
export async function fetchStudentFeedbackForms() {
  const response = await api.get("/feedback/student/forms");
  return response.data;
}


// Get active feedback forms
export async function fetchActiveFeedbackForms() {
  const response = await api.get(
    "/feedback/active"
  );

  return response.data;
}

// Get a specific active feedback form
export async function fetchActiveFeedbackForm(formId) {
  const response = await api.get(
    `/feedback/active/${formId}`
  );

  return response.data;
}

// Submit feedback
export async function submitFeedbackResponse(
  formId,
  answers
) {
  const response = await api.post(
    `/feedback/forms/${formId}/responses`,
    {
      answers,
    }
  );

  return response.data;
}

// Get student's own response
export async function fetchMyFeedbackResponse(
  formId
) {
  const response = await api.get(
    `/feedback/forms/${formId}/my-response`
  );

  return response.data;
}

// Get feedback results
export async function fetchFeedbackResults(
  formId
) {
  const response = await api.get(
    `/feedback/forms/${formId}/results`
  );

  return response.data;
}
/*
|--------------------------------------------------------------------------
| ADMIN — FEEDBACK CATEGORIES
|--------------------------------------------------------------------------
*/

// Get categories for a feedback form.
// Optional questionId filters categories for one open-ended question.
export async function fetchFeedbackCategories(
  formId,
  questionId
) {
  const params = questionId
    ? { params: { questionId } }
    : {};

  const response = await api.get(
    `/feedback/forms/${formId}/categories`,
    params
  );

  return response.data;
}


// Create a category
export async function createFeedbackCategory(
  formId,
  data
) {
  const response = await api.post(
    `/feedback/forms/${formId}/categories`,
    data
  );

  return response.data;
}


// Update a category
export async function updateFeedbackCategory(
  formId,
  categoryId,
  data
) {
  const response = await api.patch(
    `/feedback/forms/${formId}/categories/${categoryId}`,
    data
  );

  return response.data;
}


// Delete a category
export async function deleteFeedbackCategory(
  formId,
  categoryId
) {
  const response = await api.delete(
    `/feedback/forms/${formId}/categories/${categoryId}`
  );

  return response.data;
}


// Assign a response to a category
export async function assignFeedbackResponseToCategory(
  formId,
  categoryId,
  data
) {
  const response = await api.post(
    `/feedback/forms/${formId}/categories/${categoryId}/responses`,
    data
  );

  return response.data;
}


// Remove a response from a category
export async function removeFeedbackResponseFromCategory(
  formId,
  categoryId,
  data
) {
  const response = await api.delete(
    `/feedback/forms/${formId}/categories/${categoryId}/responses`,
    {
      data,
    }
  );

  return response.data;
}