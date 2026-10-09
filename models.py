from sqlalchemy.dialects.postgresql import JSONB
from extensions import db

group_subject_mapping = db.Table(
    'group_subject_mapping',
    db.Column('group_id', db.Integer, db.ForeignKey('subject_groups.id', ondelete='CASCADE'), primary_key=True),
    db.Column('subject_id', db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), primary_key=True)
)


class University(db.Model):
    __tablename__ = 'universities'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    region = db.Column(db.String(50), index=True)
    university_majors = db.relationship('UniversityMajor', backref='university', lazy=True)


class Major(db.Model):
    __tablename__ = 'majors'
    id = db.Column(db.Integer, primary_key=True)
    ministry_code = db.Column(db.String(20), unique=True)
    name = db.Column(db.String(255), nullable=False)
    group_code = db.Column(db.String(20), index=True)
    group_name = db.Column(db.String(255))
    university_majors = db.relationship('UniversityMajor', backref='major', lazy=True)


class UniversityMajor(db.Model):
    __tablename__ = 'university_majors'
    id = db.Column(db.Integer, primary_key=True)
    university_id = db.Column(db.Integer, db.ForeignKey('universities.id'), nullable=False)
    major_id = db.Column(db.Integer, db.ForeignKey('majors.id'), nullable=False)
    admission_code = db.Column(db.String(20))
    __table_args__ = (db.UniqueConstraint('university_id', 'major_id', name='_university_major_uc'),)
    admission_scores = db.relationship('AdmissionScore', backref='university_major', lazy=True)


class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class SubjectGroup(db.Model):
    __tablename__ = 'subject_groups'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    description = db.Column(db.String(255))
    subjects = db.relationship('Subject', secondary='group_subject_mapping', backref=db.backref('subject_groups', lazy=True))
    admission_scores = db.relationship('AdmissionScore', backref='subject_group', lazy=True)


class AdmissionScore(db.Model):
    __tablename__ = 'admission_scores'
    id = db.Column(db.Integer, primary_key=True)
    university_major_id = db.Column(db.Integer, db.ForeignKey('university_majors.id'), nullable=False)
    subject_group_id = db.Column(db.Integer, db.ForeignKey('subject_groups.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    base_score = db.Column(db.Numeric(5, 2), nullable=False)
    special_conditions = db.Column(JSONB)
    __table_args__ = (db.UniqueConstraint('university_major_id', 'subject_group_id', 'year', name='_score_uc'),)
