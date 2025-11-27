# Troubleshooting Guide

Common issues and solutions for BIT TMS.

## Table of Contents
1. [Login Issues](#login-issues)
2. [Data Entry Issues](#data-entry-issues)
3. [Import Issues](#import-issues)
4. [PDF Generation Issues](#pdf-generation-issues)
5. [Performance Issues](#performance-issues)
6. [Technical Issues](#technical-issues)

---

## Login Issues

### Cannot Login - "Invalid Credentials"

**Symptoms**: Error message "Invalid email or password"

**Solutions**:
1. Verify email address is correct (case-sensitive)
2. Check password (case-sensitive)
3. Ensure Caps Lock is off
4. Try resetting password (contact admin)
5. Verify account is active (contact admin)

### Session Expires Too Quickly

**Symptoms**: Logged out frequently

**Solutions**:
1. Check browser settings (cookies enabled)
2. Don't use incognito/private mode
3. Contact admin to extend session timeout
4. Avoid long periods of inactivity

### "Access Denied" After Login

**Symptoms**: Can login but can't access certain pages

**Solutions**:
1. Verify you have the correct role
2. Contact admin to check permissions
3. Try logging out and back in
4. Clear browser cache

---

## Data Entry Issues

### Cannot Save Grades

**Symptoms**: Save button disabled or error on save

**Solutions**:
1. **Verify all grades are 0-20**
   - Check for negative values
   - Check for values > 20
   - Check for non-numeric values

2. **Check required fields**
   - Participation grade must be entered
   - At least one evaluation must have a grade

3. **Network issues**
   - Check internet connection
   - Try refreshing the page
   - Try again in a few minutes

4. **Permission issues**
   - Verify you're assigned to this TUE
   - Contact admin if not assigned

### Grades Not Calculating

**Symptoms**: Final grade shows 0 or incorrect value

**Solutions**:
1. **Missing attendance**
   - Contact Schooling Manager to enter attendance
   - Presence defaults to 10/20 if not entered

2. **Missing evaluations**
   - Enter all evaluation grades
   - Missing evaluations count as 0

3. **Refresh the page**
   - Calculations may not have updated
   - Log out and back in

### Cannot Edit Saved Grades

**Symptoms**: Grade fields are read-only

**Solutions**:
1. Verify you're the assigned teacher
2. Contact admin for permission
3. Admin may have locked grades

---

## Import Issues

### Excel Import Fails - "Invalid Format"

**Symptoms**: Error message when uploading Excel file

**Solutions**:
1. **Use the template**
   - Download template from the system
   - Don't modify column names
   - Don't add/remove columns

2. **Check file format**
   - Must be .xlsx or .xls
   - Not .csv or other formats

3. **Check data format**
   - Dates: YYYY-MM-DD format
   - Student IDs: No duplicates
   - Grades: 0-20 range
   - No empty required fields

4. **File size**
   - Maximum 10MB
   - If larger, split into multiple files

### Some Rows Failed to Import

**Symptoms**: Import completes but shows errors for some rows

**Solutions**:
1. **Review error messages**
   - Each error shows row number and reason
   - Fix errors in Excel file
   - Re-import only failed rows

2. **Common errors**:
   - Duplicate student IDs
   - Invalid field/promotion codes
   - Missing required fields
   - Invalid date formats
   - Grades out of range (0-20)

### Excel Template Won't Download

**Symptoms**: Download button doesn't work

**Solutions**:
1. Check browser pop-up blocker
2. Try different browser
3. Check download folder permissions
4. Contact admin for template via email

---

## PDF Generation Issues

### PDF Won't Generate

**Symptoms**: Error or infinite loading when generating PDF

**Solutions**:
1. **Missing data**
   - Verify all grades are entered
   - Verify attendance is entered
   - Check academic structure is complete

2. **Server issues**
   - Wait a few minutes and try again
   - Contact admin if persists

3. **Browser issues**
   - Try different browser
   - Clear browser cache
   - Disable browser extensions

### PDF Generation is Slow

**Symptoms**: Takes several minutes to generate

**Solutions**:
1. **Normal for bulk generation**
   - 100 students = 5-10 minutes
   - Be patient, don't close browser

2. **Single PDF slow**
   - May indicate server issues
   - Contact admin

### PDF Won't Download

**Symptoms**: PDF generates but doesn't download

**Solutions**:
1. Check browser download settings
2. Check pop-up blocker
3. Check disk space
4. Try right-click → Save As
5. Try different browser

### PDF Content is Incorrect

**Symptoms**: PDF shows wrong data or missing information

**Solutions**:
1. **Verify source data**
   - Check grades in system
   - Verify student information
   - Ensure calculations are complete

2. **Regenerate**
   - Click "Recalculate All" first
   - Then regenerate PDF

3. **Contact admin**
   - If data is still incorrect
   - May be a system issue

---

## Performance Issues

### System is Slow

**Symptoms**: Pages load slowly, actions take long time

**Solutions**:
1. **Check internet connection**
   - Run speed test
   - Try different network

2. **Clear browser cache**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

3. **Close other tabs/applications**
   - Free up memory
   - Close unused programs

4. **Try different browser**
   - Chrome, Firefox, or Edge recommended

5. **Peak usage times**
   - System may be slower during high usage
   - Try during off-peak hours

### Page Won't Load

**Symptoms**: Blank page or loading spinner forever

**Solutions**:
1. Refresh the page (F5)
2. Clear cache and refresh (Ctrl+F5)
3. Check internet connection
4. Try different browser
5. Contact admin if persists

---

## Technical Issues

### "Network Error" or "Cannot Connect"

**Symptoms**: Error messages about network/connection

**Solutions**:
1. **Check internet connection**
   - Verify you're online
   - Try accessing other websites

2. **Check system status**
   - Contact admin to verify system is running
   - May be scheduled maintenance

3. **Firewall/proxy**
   - Check if firewall is blocking
   - Try different network

4. **VPN issues**
   - Disable VPN temporarily
   - Try direct connection

### "Server Error" or "500 Error"

**Symptoms**: Error page with 500 status code

**Solutions**:
1. **Temporary issue**
   - Wait a few minutes
   - Try again

2. **Report to admin**
   - Note what you were doing
   - Provide screenshot if possible
   - Include time of error

3. **Don't retry immediately**
   - May make problem worse
   - Wait at least 5 minutes

### Data Not Saving

**Symptoms**: Changes don't persist after save

**Solutions**:
1. **Check for error messages**
   - Look for red error text
   - Check browser console (F12)

2. **Verify save confirmation**
   - Look for success message
   - If no message, may not have saved

3. **Network interruption**
   - Check connection during save
   - Try again with stable connection

4. **Session expired**
   - Log out and back in
   - Re-enter data

### Browser Compatibility Issues

**Symptoms**: Layout broken, features don't work

**Solutions**:
1. **Use supported browsers**
   - Chrome 90+
   - Firefox 88+
   - Edge 90+
   - Safari 14+

2. **Update browser**
   - Check for updates
   - Install latest version

3. **Disable extensions**
   - Ad blockers may interfere
   - Try incognito mode

4. **Clear cache**
   - May fix display issues

---

## Getting Additional Help

### Before Contacting Support

Gather this information:
- What were you trying to do?
- What happened instead?
- Error messages (exact text or screenshot)
- Your role (admin, teacher, manager)
- Browser and version
- Time when issue occurred

### Contact Information

- **System Administrator**: [admin email]
- **Technical Support**: [support email]
- **Academic Director**: [director email]

### Emergency Issues

For critical issues (system down, data loss):
- Contact admin immediately
- Provide all details
- Don't attempt to fix yourself

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025
