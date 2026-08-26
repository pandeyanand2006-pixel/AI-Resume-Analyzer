const GeneratedResume = require('../models/GeneratedResume');

/**
 * @desc    Compare two resume versions
 * @route   POST /api/resume-comparison/compare
 * @access  Private
 */
exports.compareResumes = async (req, res) => {
  try {
    const { resumeId1, resumeId2 } = req.body;

    if (!resumeId1 || !resumeId2) {
      return res.status(400).json({
        success: false,
        message: 'Both resume IDs are required'
      });
    }

    // Fetch both resumes
    const resume1 = await GeneratedResume.findOne({
      _id: resumeId1,
      userId: req.user.id
    });

    const resume2 = await GeneratedResume.findOne({
      _id: resumeId2,
      userId: req.user.id
    });

    if (!resume1 || !resume2) {
      return res.status(404).json({
        success: false,
        message: 'One or both resumes not found'
      });
    }

    // Compare sections
    const comparison = {
      metadata: {
        resume1: {
          id: resume1._id,
          name: resume1.personalInfo?.fullName || 'Resume 1',
          createdAt: resume1.createdAt,
          updatedAt: resume1.updatedAt
        },
        resume2: {
          id: resume2._id,
          name: resume2.personalInfo?.fullName || 'Resume 2',
          createdAt: resume2.createdAt,
          updatedAt: resume2.updatedAt
        }
      },
      differences: {
        personalInfo: compareObjects(resume1.personalInfo, resume2.personalInfo),
        targetRole: {
          resume1: resume1.targetRole,
          resume2: resume2.targetRole,
          changed: resume1.targetRole !== resume2.targetRole
        },
        targetIndustry: {
          resume1: resume1.targetIndustry,
          resume2: resume2.targetIndustry,
          changed: resume1.targetIndustry !== resume2.targetIndustry
        },
        professionalSummary: {
          resume1: resume1.professionalSummary,
          resume2: resume2.professionalSummary,
          changed: resume1.professionalSummary !== resume2.professionalSummary,
          lengthDiff: (resume2.professionalSummary?.length || 0) - (resume1.professionalSummary?.length || 0)
        },
        education: compareArrays(resume1.education || [], resume2.education || []),
        workExperience: compareArrays(resume1.workExperience || [], resume2.workExperience || []),
        skills: compareArrays(resume1.skills || [], resume2.skills || [], 'name'),
        projects: compareArrays(resume1.projects || [], resume2.projects || []),
        certifications: compareArrays(resume1.certifications || [], resume2.certifications || []),
        achievements: compareArrays(resume1.achievements || [], resume2.achievements || [])
      },
      summary: {
        totalChanges: 0,
        sectionsChanged: [],
        addedItems: 0,
        removedItems: 0,
        modifiedItems: 0
      }
    };

    // Calculate summary statistics
    Object.keys(comparison.differences).forEach(section => {
      const diff = comparison.differences[section];
      
      if (section === 'targetRole' || section === 'targetIndustry' || section === 'professionalSummary') {
        if (diff.changed) {
          comparison.summary.totalChanges++;
          comparison.summary.sectionsChanged.push(section);
          comparison.summary.modifiedItems++;
        }
      } else if (section === 'personalInfo') {
        const changedFields = Object.keys(diff).filter(key => diff[key].changed);
        if (changedFields.length > 0) {
          comparison.summary.totalChanges += changedFields.length;
          comparison.summary.sectionsChanged.push(section);
          comparison.summary.modifiedItems += changedFields.length;
        }
      } else if (diff.added || diff.removed || diff.modified) {
        comparison.summary.addedItems += diff.added?.length || 0;
        comparison.summary.removedItems += diff.removed?.length || 0;
        comparison.summary.modifiedItems += diff.modified?.length || 0;
        comparison.summary.totalChanges += (diff.added?.length || 0) + (diff.removed?.length || 0) + (diff.modified?.length || 0);
        
        if (comparison.summary.totalChanges > 0) {
          comparison.summary.sectionsChanged.push(section);
        }
      }
    });

    res.status(200).json({
      success: true,
      comparison
    });

  } catch (error) {
    console.error('Resume comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare resumes',
      error: error.message
    });
  }
};

/**
 * Helper: Compare two objects field by field
 */
function compareObjects(obj1 = {}, obj2 = {}) {
  const result = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach(key => {
    result[key] = {
      resume1: obj1[key] || null,
      resume2: obj2[key] || null,
      changed: obj1[key] !== obj2[key]
    };
  });

  return result;
}

/**
 * Helper: Compare two arrays
 */
function compareArrays(arr1 = [], arr2 = [], compareKey = null) {
  const result = {
    resume1Count: arr1.length,
    resume2Count: arr2.length,
    countDiff: arr2.length - arr1.length,
    added: [],
    removed: [],
    modified: [],
    unchanged: []
  };

  // For simple arrays (like strings)
  if (!compareKey && arr1.length > 0 && typeof arr1[0] === 'string') {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    arr2.forEach(item => {
      if (!set1.has(item)) {
        result.added.push(item);
      }
    });

    arr1.forEach(item => {
      if (!set2.has(item)) {
        result.removed.push(item);
      } else {
        result.unchanged.push(item);
      }
    });

    return result;
  }

  // For arrays of objects
  if (compareKey) {
    const map1 = new Map(arr1.map(item => [item[compareKey], item]));
    const map2 = new Map(arr2.map(item => [item[compareKey], item]));

    // Find added items
    arr2.forEach(item => {
      if (!map1.has(item[compareKey])) {
        result.added.push(item);
      }
    });

    // Find removed and modified items
    arr1.forEach(item => {
      if (!map2.has(item[compareKey])) {
        result.removed.push(item);
      } else {
        const item2 = map2.get(item[compareKey]);
        if (JSON.stringify(item) !== JSON.stringify(item2)) {
          result.modified.push({ old: item, new: item2 });
        } else {
          result.unchanged.push(item);
        }
      }
    });

    return result;
  }

  // Default: just count difference
  result.added = arr2.slice(arr1.length);
  result.removed = arr1.slice(arr2.length);

  return result;
}

/**
 * @desc    Get user's resumes for comparison
 * @route   GET /api/resume-comparison/list
 * @access  Private
 */
exports.getResumesForComparison = async (req, res) => {
  try {
    const resumes = await GeneratedResume.find({ userId: req.user.id })
      .select('_id personalInfo.fullName targetRole createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      resumes: resumes.map(r => ({
        id: r._id,
        name: r.personalInfo?.fullName || 'Untitled Resume',
        targetRole: r.targetRole || 'N/A',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message
    });
  }
};
