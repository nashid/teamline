x = function(doc) {
  if (doc.deliverable >= "d1") {
    var tGrade = ( (doc.testStats && doc.testStats.passPercent) ? doc.testStats.passPercent : 0 );
    var cGrade = ( (doc.coverStats && doc.coverStats.lines && doc.coverStats.lines.percentage) ? Math.min(doc.coverStats.lines.percentage+5, 100) : 0 );

    emit([doc.team, doc.deliverable, doc.timestamp], {
      "team": doc.team,
      "user": doc.committer,
      "sha": doc.commit,
      "deliverable": doc.deliverable,
      "testGrade": tGrade.toFixed(4),
      "coverGrade": cGrade.toFixed(4),
      "finalGrade": (0.8*tGrade + 0.2*cGrade).toFixed(4),
      "passNames": doc.testStats.passNames || [],
      "skipNames": doc.testStats.skipNames || [],
      "failNames": doc.testStats.failNames || [],
      "passCount": doc.testStats.passCount || 0,
      "skipCount": doc.testStats.skipCount || 0,
      "failCount": doc.testStats.failCount || 0,
      "timestamp": doc.timestamp
    })
  }
}
