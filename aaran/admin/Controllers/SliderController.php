<?php

namespace Aaran\admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SliderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sliders/Index', [
            'sliders' => Slider::with('tenant')->latest()->paginate(10),
            'tenants' => Tenant::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Sliders/Create', [
            'tenants' => Tenant::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'title' => 'required',
            'media_type' => 'required',
        ]);

        Slider::create($request->all());

        return redirect()->route('admin.sliders.index');
    }

    public function edit(Slider $slider)
    {
        return Inertia::render('Admin/Sliders/Edit', [
            'slider' => $slider,
            'tenants' => Tenant::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Slider $slider)
    {
        $slider->update($request->all());

        return back();
    }

    public function destroy(Slider $slider)
    {
        $slider->delete();

        return back();
    }
}
