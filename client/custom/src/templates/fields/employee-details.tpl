<div class="employee-details-container card shadow-sm border-0">
    <div class="card-body p-4">
        <div class="row align-items-center">
            <div class="col-3 text-center">
                <div class="avatar-lg rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-2">
                    <i class="fas fa-user text-white" style="font-size: 2rem;"></i>
                </div>
            </div>
            <div class="col-9">
                <h5 class="mb-2">{{fullName}}</h5>
                <div class="text-muted mb-1"><i class="fas fa-briefcase mr-2"></i>{{title}}</div>
                <div class="text-muted mb-1"><i class="fas fa-building mr-2"></i>{{department}}</div>
                <div class="text-muted mb-2"><i class="fas fa-circle text-success mr-1"></i>{{status}}</div>
                <div class="d-flex">
                    <a href="mailto:{{email}}" class="btn btn-sm btn-outline-primary mr-2"><i class="fas fa-envelope"></i></a>
                    <a href="tel:{{phone}}" class="btn btn-sm btn-outline-secondary"><i class="fas fa-phone"></i></a>
                </div>
            </div>
        </div>
    </div>
</div>
